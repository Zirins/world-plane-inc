namespace model;

using System.Data;
using dal;
using services;

public class ReservationRequest
{
    // Each flight leg as selected by the user
    public List<FlightLeg> OutboundLegs { get; set; } = new();
    public List<FlightLeg>? ReturnLegs { get; set; }
}

public class FlightLeg
{
    public string FlightNumber { get; set; } = string.Empty;
    public string DepartAirport { get; set; } = string.Empty;
    public string ArriveAirport { get; set; } = string.Empty;
    public DateTime DepartDateTime { get; set; }
    public DateTime ArriveDateTime { get; set; }
}

public class ReservationResult
{
    public string ConfirmationCode { get; set; } = string.Empty;
    public string TripType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<Dictionary<string, object>> OutboundLegs { get; set; } = [];
    public List<Dictionary<string, object>> ReturnLegs { get; set; } = [];
}

public static class ReservationModel
{
    public static string Create(ReservationRequest request)
    {
        var tripType = request.ReturnLegs?.Any() == true ? "round_trip" : "one_way";

        // Build a DataTable of all legs to pass to the DAL
        var dt = new DataTable();
        dt.Columns.Add("FlightNumber", typeof(string));
        dt.Columns.Add("DepartAirport", typeof(string));
        dt.Columns.Add("ArriveAirport", typeof(string));
        dt.Columns.Add("DepartDateTime", typeof(DateTime));
        dt.Columns.Add("ArriveDateTime", typeof(DateTime));
        dt.Columns.Add("LegDirection", typeof(string));
        dt.Columns.Add("LegOrder", typeof(int));

        // Add outbound legs
        for (var i = 0; i < request.OutboundLegs.Count; i++)
        {
            var leg = request.OutboundLegs[i];
            dt.Rows.Add(
                leg.FlightNumber,
                leg.DepartAirport,
                leg.ArriveAirport,
                leg.DepartDateTime,
                leg.ArriveDateTime,
                "outbound",
                i + 1);
        }

        // Add return legs if round trip
        if (request.ReturnLegs?.Any() == true)
        {
            for (var i = 0; i < request.ReturnLegs.Count; i++)
            {
                var leg = request.ReturnLegs[i];
                dt.Rows.Add(
                    leg.FlightNumber,
                    leg.DepartAirport,
                    leg.ArriveAirport,
                    leg.DepartDateTime,
                    leg.ArriveDateTime,
                    "return",
                    i + 1);
            }
        }

        return ReservationDal.Create(dt, tripType);
    }

    public static ReservationResult? GetByConfirmationCode(string confirmationCode)
    {
        var dt = ReservationDal.GetByConfirmationCode(confirmationCode);

        if (dt.Rows.Count == 0)
            return null;

        var firstRow = dt.Rows[0];

#pragma warning disable CA1305 // Specify IFormatProvider
        var result = new ReservationResult
        {
            ConfirmationCode = firstRow["confirmation_code"].ToString() ?? string.Empty,
            TripType = firstRow["trip_type"].ToString() ?? string.Empty,
            CreatedAt = Convert.ToDateTime(firstRow["created_at"]),
            OutboundLegs = ToList(dt, "outbound"),
            ReturnLegs = ToList(dt, "return")
        };
#pragma warning restore CA1305 // Specify IFormatProvider

        return result;
    }

#pragma warning disable CA1305 // Specify IFormatProvider
    private static List<Dictionary<string, object>> ToList(DataTable dt, string direction) => [.. dt.Rows
            .Cast<DataRow>()
            .Where(row => row["leg_direction"].ToString() == direction)
            .OrderBy(row => Convert.ToInt32(row["leg_order"]))
            .Select(row => new Dictionary<string, object>
            {
                { "flightNumber",  row["flight_number"] },
                { "departAirport", row["depart_airport"] },
                { "arriveAirport", row["arrive_airport"] },
                { "departDateTime", row["depart_datetime"] },
                { "arriveDateTime", row["arrive_datetime"] }
            })];
#pragma warning restore CA1305 // Specify IFormatProvider
}
