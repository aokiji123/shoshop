using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Auth;

public class RegisterDto
{
    [Required, MaxLength(255)]
    public string Name { get; set; }

    [Required, MaxLength(255), EmailAddress]
    public string Email { get; set; }

    [Required, MinLength(6), MaxLength(255)]
    public string Password { get; set; }

    public string? Image { get; set; }
}