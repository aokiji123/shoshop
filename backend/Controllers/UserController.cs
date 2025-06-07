using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using backend.DTOs.Users;
using backend.Services;

namespace backend.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : BaseController
{
    private readonly DataContext _context;
    private readonly IImageService _imageService;
    private readonly ILogger<UserController> _logger;
    private readonly IMapper _mapper;

    public UserController(DataContext context, IImageService imageService, ILogger<UserController> logger,
        IMapper mapper)
    {
        _context = context;
        _imageService = imageService;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <returns>Current user data</returns>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 404)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            _logger.LogInformation("Request to get current user data");

            var userId = GetCurrentUserId();
            if (userId == null)
            {
                _logger.LogWarning("Invalid user token");
                return Unauthorized("Invalid user ID in token");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found", userId);
                return NotFound("User not found");
            }

            var userDto = _mapper.Map<UserDto>(user);

            _logger.LogInformation("User {UserId} data successfully retrieved", userId);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            return HandleException<UserDto>(ex, _logger, "GetCurrentUser");
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    /// <param name="updateDto">Data to update</param>
    /// <returns>Updated user data</returns>
    [HttpPut]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), 200)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 404)]
    public async Task<ActionResult<UserDto>> UpdateCurrentUser([FromForm] UpdateUserDto updateDto, IFormFile? imageFile)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();

                _logger.LogWarning("Validation error when updating user: {Errors}", string.Join(", ", errors));

                return BadRequest(new
                {
                    success = false,
                    message = "Validation errors occurred",
                    errors = errors
                });
            }

            var userId = GetCurrentUserId();
            if (userId == null)
            {
                _logger.LogWarning("Invalid user token when updating profile");
                return Unauthorized("Invalid user ID in token");
            }

            _logger.LogInformation("User {UserId} attempting to update profile", userId);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found when updating", userId);
                return NotFound("User not found");
            }

            if (user.Email != updateDto.Email)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == updateDto.Email && u.Id != userId);

                if (existingUser != null)
                {
                    _logger.LogWarning("Attempt to use existing email {Email}", updateDto.Email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Email already exists",
                        errors = new[] { "This email is already in use by another user" }
                    });
                }
            }

            string? oldImagePath = user.Image;

            if (imageFile != null)
            {
                try
                {
                    var newImagePath = await _imageService.SaveImageAsync(imageFile, "users");
                    _logger.LogInformation("New image uploaded for user {UserId}: {ImagePath}", userId, newImagePath);

                    if (!string.IsNullOrEmpty(oldImagePath) && oldImagePath.StartsWith("/uploads/"))
                    {
                        await _imageService.DeleteImageAsync(oldImagePath);
                        _logger.LogInformation("Old image deleted for user {UserId}: {ImagePath}", userId,
                            oldImagePath);
                    }

                    user.Image = newImagePath;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Image upload failed for user {UserId} update", userId);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Image upload failed",
                        errors = new[] { ex.Message }
                    });
                }
            }
            else if (!string.IsNullOrEmpty(updateDto.Image) && updateDto.Image != user.Image)
            {
                if (!string.IsNullOrEmpty(oldImagePath) && oldImagePath.StartsWith("/uploads/"))
                {
                    await _imageService.DeleteImageAsync(oldImagePath);
                    _logger.LogInformation("Old image deleted for user {UserId}: {ImagePath}", userId, oldImagePath);
                }

                user.Image = updateDto.Image;
            }

            _mapper.Map(updateDto, user);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            var userDto = _mapper.Map<UserDto>(user);

            _logger.LogInformation("User {UserId} successfully updated profile", userId);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            return HandleException<UserDto>(ex, _logger, "UpdateCurrentUser");
        }
    }

    /// <summary>
    /// Delete current user account
    /// </summary>
    /// <returns>Deletion confirmation</returns>
    [HttpDelete]
    [Authorize]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 404)]
    public async Task<ActionResult<object>> DeleteCurrentUser()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                _logger.LogWarning("Invalid user token when deleting account");
                return Unauthorized("Invalid user ID in token");
            }

            _logger.LogInformation("User {UserId} attempting to delete account", userId);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found when deleting", userId);
                return NotFound("User not found");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} successfully deleted", userId);
            return Ok(new { Message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            return HandleException<object>(ex, _logger, "DeleteCurrentUser");
        }
    }
}