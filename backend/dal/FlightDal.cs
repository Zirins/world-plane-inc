namespace dal;

using System.Data;
using MySql.Data.MySqlClient;

public static class FlightDal
{
    private const string connectionString = "server=host.docker.internal;port=3333;uid=root;pwd=pass;database=FlightData";

    private static readonly string[] Tables = { "deltas", "southwests" };

    public static DataTable SearchFlights(
        string departureCode,
        string arrivalCode,
        DateTime windowStart,
        DateTime windowEnd,
        string sortBy = "DepartDateTime")
    {
        var dt = new DataTable();
        var orderByColumn = sortBy switch
        {
            "ArrivalTime" => "ArriveDateTime",
            "TravelTime" => "ArriveDateTime",
            _ => "DepartDateTime"
        };

        using var connection = new MySqlConnection(connectionString);
        connection.Open();

        foreach (var table in Tables)
        {
            var tempDt = new DataTable();
            using var da = new MySqlDataAdapter($@"
            SELECT id, FlightNumber, DepartAirport, ArriveAirport,
                   DepartDateTime, ArriveDateTime
            FROM {table}
            WHERE DepartAirport  = @dep
              AND ArriveAirport  = @arr
              AND DepartDateTime >= @start
              AND DepartDateTime <= @end
            ORDER BY {orderByColumn} ASC
        ", connection);

            da.SelectCommand.Parameters.AddWithValue("@dep", departureCode);
            da.SelectCommand.Parameters.AddWithValue("@arr", arrivalCode);
            da.SelectCommand.Parameters.AddWithValue("@start", windowStart);
            da.SelectCommand.Parameters.AddWithValue("@end", windowEnd);

            da.Fill(tempDt);
            dt.Merge(tempDt);
        }

        return dt;
    }

    public static DataTable GetFlightsFromAirport(
    string departureCode,
    DateTime windowStart,
    DateTime windowEnd)
    {
        var dt = new DataTable();

        using var connection = new MySqlConnection(connectionString);
        connection.Open();

        foreach (var table in Tables)
        {
            var tempDt = new DataTable();
            using var da = new MySqlDataAdapter($@"
            SELECT id, FlightNumber, DepartAirport, ArriveAirport,
                   DepartDateTime, ArriveDateTime
            FROM {table}
            WHERE DepartAirport  = @dep
              AND DepartDateTime >= @start
              AND DepartDateTime <= @end
        ", connection);

            da.SelectCommand.Parameters.AddWithValue("@dep", departureCode);
            da.SelectCommand.Parameters.AddWithValue("@start", windowStart);
            da.SelectCommand.Parameters.AddWithValue("@end", windowEnd);

            da.Fill(tempDt);
            dt.Merge(tempDt);
        }

        return dt;
    }

    public static DataTable GetAirportCodes()
    {
        var dt = new DataTable();

        using var connection = new MySqlConnection(connectionString);
        connection.Open();

        var sql = string.Join(" UNION ", Tables.Select(t =>
            $"SELECT DISTINCT DepartAirport AS code FROM {t} " +
            $"UNION SELECT DISTINCT ArriveAirport AS code FROM {t}"));

        using var da = new MySqlDataAdapter(sql + " ORDER BY code", connection);
        da.Fill(dt);

        return dt;
    }
}
