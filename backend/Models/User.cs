using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(255)]
    public string Name { get; set; }
    
    [Required, MaxLength(255), EmailAddress]
    public string Email { get; set; }
    
    [Required, MaxLength(255)]
    public string Password { get; set; }
    
    [Required]
    public bool IsAdmin { get; set; } = false;
    
    public string Image { get; set; } // URL or base64; use byte[] for BYTEA
}