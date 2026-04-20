namespace model;

using System.Data;
using dal;
using services;

public class FlightSearchRequest
{
    public string DepartureAirportCode { get; set; } = string.Empty;
    public string ArrivalAirportCode { get; set; } = string.Empty;
    public DateOnly DepartureDate { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public string SortBy { get; set; } = "DepartureTime"; // DepartureTime | ArrivalTime | TravelTime
}

public class FlightSearchResult
{
    // Each route is a list of flights (legs) representing a full path
    public List<List<Dictionary<string, object>>> OutboundRoutes { get; set; } = [];
    public List<List<Dictionary<string, object>>> ReturnRoutes { get; set; } = [];
}

public static class FlightModel
{
    public static List<string> GetAirportCodes()
    {
        var dt = FlightDal.GetAirportCodes();

        return dt.Rows
            .Cast<DataRow>()
            .Select(row => row["code"].ToString() ?? string.Empty)
            .OrderBy(code => code)
            .ToList();
    }

    public static FlightSearchResult Search(FlightSearchRequest request)
    {
        var windowStart = request.DepartureDate.ToDateTime(TimeOnly.MinValue);
        var windowEnd = request.DepartureDate.ToDateTime(TimeOnly.MaxValue);

        // Find all valid outbound routes including connecting flights
        var outboundRoutes = FlightRoutingService.FindRoutes(
            request.DepartureAirportCode,
            request.ArrivalAirportCode,
            windowStart,
            windowEnd);

        var returnRoutes = new List<List<DataRow>>();
        if (request.ReturnDate.HasValue)
        {
            var retWindowStart = request.ReturnDate.Value.ToDateTime(TimeOnly.MinValue);
            var retWindowEnd = request.ReturnDate.Value.ToDateTime(TimeOnly.MaxValue);

            returnRoutes = FlightRoutingService.FindRoutes(
                request.ArrivalAirportCode,
                request.DepartureAirportCode,
                retWindowStart,
                retWindowEnd);
        }

        return new FlightSearchResult
        {
            OutboundRoutes = SortRoutes(outboundRoutes, request.SortBy),
            ReturnRoutes = SortRoutes(returnRoutes, request.SortBy)
        };
    }

    private static List<List<Dictionary<string, object>>> SortRoutes(
        List<List<DataRow>> routes,
        string sortBy)
    {
        var mapped = routes.Select(route => route
            .Select(flight => new Dictionary<string, object>
            {
            { "FlightNumber",  flight["FlightNumber"] },
            { "DepartAirport", flight["DepartAirport"] },
            { "ArriveAirport", flight["ArriveAirport"] },
            { "DepartDateTime", flight["DepartDateTime"] },
            { "ArriveDateTime", flight["ArriveDateTime"] }
            })
            .ToList()
        ).ToList();

        return sortBy switch
        {
            "ArrivalTime" => mapped
                .OrderBy(r => Convert.ToDateTime(r.Last()["ArriveDateTime"]))
                .ToList(),
            "TravelTime" => mapped
                .OrderBy(r => Convert.ToDateTime(r.Last()["ArriveDateTime"]) -
                              Convert.ToDateTime(r.First()["DepartDateTime"]))
                .ToList(),
            _ => mapped
                .OrderBy(r => Convert.ToDateTime(r.First()["DepartDateTime"]))
                .ToList()
        };
    }

    private static DataTable Sort(DataTable dt, string sortBy)
    {
        var view = dt.DefaultView;
        view.Sort = sortBy switch
        {
            "ArrivalTime" => "ArriveDateTime ASC",
            "TravelTime" => "ArriveDateTime ASC",
            _ => "DepartDateTime ASC"
        };
        return view.ToTable();
    }

    private static List<Dictionary<string, object>> ToList(DataTable dt) => [.. dt.Rows
            .Cast<DataRow>()
            .Select(row => dt.Columns
                .Cast<DataColumn>()
                .ToDictionary(
                    col => col.ColumnName,
                    col => row[col] ?? string.Empty))];
}
