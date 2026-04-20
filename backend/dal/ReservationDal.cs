namespace dal;

using System.Data;
using MySql.Data.MySqlClient;

public static class ReservationDal
{
    private const string connectionString = "server=host.docker.internal;port=3333;uid=root;pwd=pass;database=FlightData";

    public static string Create(DataTable flights, string tripType)
    {
        using var connection = new MySqlConnection(connectionString);
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Generate confirmation code
            var confirmationCode = GenerateConfirmationCode();

            // Insert reservation
            using var reservationCmd = new MySqlCommand(@"
                INSERT INTO reservation (confirmation_code, trip_type)
                VALUES (@code, @tripType);
                SELECT LAST_INSERT_ID();
            ", connection, transaction);

            reservationCmd.Parameters.AddWithValue("@code", confirmationCode);
            reservationCmd.Parameters.AddWithValue("@tripType", tripType);
            var reservationId = Convert.ToInt32(reservationCmd.ExecuteScalar());

            // Insert each flight leg
            foreach (DataRow row in flights.Rows)
            {
                using var legCmd = new MySqlCommand(@"
                    INSERT INTO reservation_flight
                        (reservation_id, flight_number, depart_airport, arrive_airport,
                         depart_datetime, arrive_datetime, leg_direction, leg_order)
                    VALUES
                        (@reservationId, @flightNumber, @departAirport, @arriveAirport,
                         @departDatetime, @arriveDatetime, @legDirection, @legOrder);
                ", connection, transaction);

                legCmd.Parameters.AddWithValue("@reservationId", reservationId);
                legCmd.Parameters.AddWithValue("@flightNumber", row["FlightNumber"]);
                legCmd.Parameters.AddWithValue("@departAirport", row["DepartAirport"]);
                legCmd.Parameters.AddWithValue("@arriveAirport", row["ArriveAirport"]);
                legCmd.Parameters.AddWithValue("@departDatetime", row["DepartDateTime"]);
                legCmd.Parameters.AddWithValue("@arriveDatetime", row["ArriveDateTime"]);
                legCmd.Parameters.AddWithValue("@legDirection", row["LegDirection"]);
                legCmd.Parameters.AddWithValue("@legOrder", row["LegOrder"]);
                legCmd.ExecuteNonQuery();
            }

            transaction.Commit();
            return confirmationCode;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public static DataTable GetByConfirmationCode(string confirmationCode)
    {
        var dt = new DataTable();

        using var connection = new MySqlConnection(connectionString);
        connection.Open();

        using var da = new MySqlDataAdapter(@"
            SELECT r.confirmation_code, r.trip_type, r.created_at,
                   rf.flight_number, rf.depart_airport, rf.arrive_airport,
                   rf.depart_datetime, rf.arrive_datetime,
                   rf.leg_direction, rf.leg_order
            FROM reservation r
            JOIN reservation_flight rf ON rf.reservation_id = r.id
            WHERE r.confirmation_code = @code
            ORDER BY rf.leg_direction, rf.leg_order
        ", connection);

        da.SelectCommand.Parameters.AddWithValue("@code", confirmationCode);
        da.Fill(dt);

        return dt;
    }

    private static string GenerateConfirmationCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var code = new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        return $"WP-{code}";
    }
}
