using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly DataContext _context;

    public UserController(DataContext context) => _context = context;

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsAdmin { get; set; }
        public string Image { get; set; }
    }

    public class UpdateUserDto
    {
        [Required, MaxLength(255)]
        public string Name { get; set; }

        [MaxLength(255)]
        public string Image { get; set; }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
       
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;
                         
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user ID in token");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound("User not found");

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            Image = user.Image
        };

        return Ok(userDto);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserDto updateDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;
                         
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid user ID in token");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound("User not found");

        user.Name = updateDto.Name;
        user.Image = updateDto.Image;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            Image = user.Image
        };

        return Ok(userDto);
    }

    [HttpDelete]
    [Authorize]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;
                         
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Invalid user ID in token");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound("User not found");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "User deleted successfully" });
    }
}