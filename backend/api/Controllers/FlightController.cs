namespace api;
using Microsoft.AspNetCore.Mvc;
using model;

[ApiController]
[Route("api/v1/[controller]/[Action]")]
public class FlightController : ControllerBase
{

    [HttpGet("airports")]
    public IActionResult GetAirports()
    {
        var dt = FlightModel.GetAirportCodes();
        return Ok(dt);
    }

    [HttpGet("search")]
    public IActionResult Search([FromQuery] FlightSearchRequest request)
    {
        if (string.IsNullOrEmpty(request.DepartureAirportCode) ||
            string.IsNullOrEmpty(request.ArrivalAirportCode))
            return this.BadRequest(new { error = "Departure and arrival airports are required." });

        var result = FlightModel.Search(request);
        return this.Ok(result);
    }
}
