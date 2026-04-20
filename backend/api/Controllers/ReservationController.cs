namespace api;

using Microsoft.AspNetCore.Mvc;
using model;

[ApiController]
[Route("api/v1/[controller]/[Action]")]
public class ReservationController : ControllerBase
{

    [HttpPost]
    public IActionResult CreateReservation([FromBody] ReservationRequest reservation) => this.Ok(ReservationModel.Create(reservation));

    [HttpGet("{confirmationCode}")]
    public IActionResult GetByConfirmationCode(string confirmationCode)
    {
        var reservation = ReservationModel.GetByConfirmationCode(confirmationCode);
        if (reservation == null)
            return NotFound(new { error = $"No reservation found for {confirmationCode}." });

        return Ok(reservation);
    }
}
