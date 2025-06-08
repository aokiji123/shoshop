using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using backend.Data;
using backend.DTOs.Auth;
using backend.Models;

namespace backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : BaseController
{
    private readonly DataContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;
    private readonly IMapper _mapper;
    
    public AuthController(DataContext context, IConfiguration configuration, ILogger<AuthController> logger, IMapper mapper)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="registerDto">User registration data including name, email, password, and optional image</param>
    /// <returns>Authentication token and user information</returns>
    /// <response code="201">User registered successfully and returns authentication token</response>
    /// <response code="400">Invalid input data or email already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), 201)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            _logger.LogInformation("Registration attempt for email: {Email}", registerDto.Email);

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                _logger.LogWarning("Validation error during registration for {Email}: {Errors}", 
                    registerDto.Email, string.Join(", ", errors));
                
                return BadRequest(new
                {
                    success = false,
                    message = "Validation errors occurred",
                    errors = errors
                });
            }
            
            if (await _context.Users.AsNoTracking().AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower()))
            {
                _logger.LogWarning("Registration failed - email already exists: {Email}", registerDto.Email);
                return BadRequest(new
                {
                    success = false,
                    message = "Email already exists",
                    errors = new[] { "This email is already registered" }
                });
            }

            var user = _mapper.Map<User>(registerDto);
            user.Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            var token = GenerateJwtToken(user);

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Token = token;

            _logger.LogInformation("User {UserId} registered successfully with email: {Email}", user.Id, user.Email);
            return StatusCode(201, response);
        }
        catch (Exception ex)
        {
            return HandleException<AuthResponseDto>(ex, _logger, "Register");
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="loginDto">User login credentials</param>
    /// <returns>Authentication token and user information</returns>
    /// <response code="200">Login successful and returns authentication token</response>
    /// <response code="400">Invalid input data</response>
    /// <response code="401">Invalid email or password</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", loginDto.Email);

            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                _logger.LogWarning("Validation error during login for {Email}: {Errors}", 
                    loginDto.Email, string.Join(", ", errors));
                
                return BadRequest(new
                {
                    success = false,
                    message = "Validation errors occurred",
                    errors = errors
                });
            }
            
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
                return Unauthorized("Invalid email or password");
            }

            var token = GenerateJwtToken(user);

            var response = _mapper.Map<AuthResponseDto>(user);
            response.Token = token;

            _logger.LogInformation("User {UserId} logged in successfully", user.Id);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return HandleException<AuthResponseDto>(ex, _logger, "Login");
        }
    }
    
    /// <summary>
    /// Generate JWT token for authenticated user
    /// </summary>
    /// <param name="user">User object for which to generate the token</param>
    /// <returns>JWT token string</returns>
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("name", user.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}