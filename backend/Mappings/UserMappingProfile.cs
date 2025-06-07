using AutoMapper;
using backend.DTOs.Users;
using backend.Models;

namespace backend.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        // User -> UserDto
        CreateMap<User, UserDto>();
        
        // UpdateUserDto -> User
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsAdmin, opt => opt.Ignore())
            .ForMember(dest => dest.Password, opt => opt.Ignore())
            .ForMember(dest => dest.Orders, opt => opt.Ignore());
    }
}