namespace backend.DTOs.Users;

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public bool IsAdmin { get; set; }
    public string Image { get; set; }
    public string? TgTag { get; set; }
}