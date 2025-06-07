using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Users;

public class UpdateUserDto
{
    [Required, MaxLength(255)]
    public string Name { get; set; }

    [MaxLength(3000)]
    public string? Image { get; set; }
        
    [Required, MaxLength(255), EmailAddress]
    public string Email { get; set; }
        
    [MaxLength(100)]
    public string? TgTag { get; set; }
}