namespace backend.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; }
    public Guid UserId { get; set; }
    public bool IsAdmin { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}