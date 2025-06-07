using AutoMapper;
using backend.DTOs.Auth;
using backend.Models;

namespace backend.Mappings;

public class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        // RegisterDto -> User
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Password, opt => opt.Ignore())
            .ForMember(dest => dest.IsAdmin, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.Orders, opt => opt.Ignore())
            .ForMember(dest => dest.TgTag, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email.ToLower()));

        // User -> AuthResponseDto
        CreateMap<User, AuthResponseDto>()
            .ForMember(dest => dest.Token, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id));
    }
}