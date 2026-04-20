namespace services;

using System.Data;
using dal;

public static class FlightRoutingService
{
    private const int MinLayoverMinutes = 45;
    private const int MaxLayoverMinutes = 240;
    private const int MaxStops = 1;        // reduce to 1 stop max — more realistic
    private const int MaxRoutes = 10;      // reduce to 10 routes — enough for a user to choose from
    private const int MaxTotalTravelHours = 12; // no routes longer than 12 hours total

    public static List<List<DataRow>> FindRoutes(
        string departureCode,
        string arrivalCode,
        DateTime windowStart,
        DateTime windowEnd)
    {
        var routes = new List<List<DataRow>>();

        // Fetch ALL flights for the day upfront in two queries — one per table
        // This avoids hitting the DB on every recursive call
        var allFlights = FlightDal.GetFlightsFromAirport(departureCode, windowStart, windowEnd);

        foreach (DataRow flight in allFlights.Rows)
        {
            if (routes.Count >= MaxRoutes)
                break;

            var path = new List<DataRow> { flight };
            BuildPaths(path, arrivalCode, windowStart, windowEnd, routes);
        }

        return routes;
    }

    private static void BuildPaths(
        List<DataRow> currentPath,
        string finalDestination,
        DateTime windowStart,
        DateTime windowEnd,
        List<List<DataRow>> routes)
    {
        if (routes.Count >= MaxRoutes)
            return;

        var lastFlight = currentPath.Last();
        var lastArrival = Convert.ToString(lastFlight["ArriveAirport"]) ?? string.Empty;
        var lastArrivalTime = Convert.ToDateTime(lastFlight["ArriveDateTime"]);
        var firstDepartTime = Convert.ToDateTime(currentPath.First()["DepartDateTime"]);

        // Reject routes where arrival time is before departure time (overnight/next-day)
        if (lastArrivalTime < firstDepartTime)
            return;

        // Reject routes that exceed the max total travel time
        var totalHours = (lastArrivalTime - firstDepartTime).TotalHours;
        if (totalHours > MaxTotalTravelHours)
            return;

        // We reached the destination — save this route
        if (lastArrival == finalDestination)
        {
            routes.Add(new List<DataRow>(currentPath));
            return;
        }

        // Stop if we've hit the max number of stops
        if (currentPath.Count > MaxStops)
            return;

        // Track visited airports to prevent loops
        var visitedAirports = currentPath
            .Select(f => Convert.ToString(f["ArriveAirport"]) ?? string.Empty)
            .ToHashSet();
        visitedAirports.Add(Convert.ToString(currentPath.First()["DepartAirport"]) ?? string.Empty);

        var earliestNext = lastArrivalTime.AddMinutes(MinLayoverMinutes);
        var latestNext = lastArrivalTime.AddMinutes(MaxLayoverMinutes);

        if (earliestNext > windowEnd)
            return;
        var searchEnd = latestNext < windowEnd ? latestNext : windowEnd;

        var connectingFlights = FlightDal.GetFlightsFromAirport(
            lastArrival,
            earliestNext,
            searchEnd);

        foreach (DataRow next in connectingFlights.Rows)
        {
            if (routes.Count >= MaxRoutes)
                return;

            var nextArrival = Convert.ToString(next["ArriveAirport"]) ?? string.Empty;
            var nextArrivalTime = Convert.ToDateTime(next["ArriveDateTime"]);
            var nextDepartTime = Convert.ToDateTime(next["DepartDateTime"]);

            // Skip airports already in the path
            if (visitedAirports.Contains(nextArrival))
                continue;

            // Skip if arrival is before departure (overnight flight)
            if (nextArrivalTime < nextDepartTime)
                continue;

            // Skip if total travel time would exceed the limit
            if ((nextArrivalTime - firstDepartTime).TotalHours > MaxTotalTravelHours)
                continue;

            currentPath.Add(next);
            BuildPaths(currentPath, finalDestination, windowStart, windowEnd, routes);
            currentPath.RemoveAt(currentPath.Count - 1);
        }
    }
}
