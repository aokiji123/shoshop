using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class AdminsChats
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public long ChatId { get; set; }
    
    [Required, MaxLength(255)]
    public string? TgTag { get; set; }
}