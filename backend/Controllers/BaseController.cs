using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controllers;

public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Extract current user ID from JWT token
    /// </summary>
    /// <returns>User ID or null if token is invalid</returns>
    protected Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                          ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;
                         
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    protected ActionResult<T> HandleException<T>(Exception ex, ILogger logger, string action)
    {
        logger.LogError(ex, "Error in {Action}", action);
        return StatusCode(500, "Internal server error");
    }
}