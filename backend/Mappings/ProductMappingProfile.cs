using AutoMapper;
using backend.DTOs.Products;
using backend.Models;

namespace backend.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        // Product -> ProductDto
        CreateMap<Product, ProductResponseDto>()
            .ForMember(dest => dest.IsLiked, opt => opt.MapFrom((src, dest, destMember, context) =>
            {
                var currentUserId = context.Items.ContainsKey("CurrentUserId") 
                    ? (Guid?)context.Items["CurrentUserId"] 
                    : null;
                    
                return currentUserId.HasValue && src.UserLikes.Any(ul => ul.UserId == currentUserId.Value);
            }));

        // CreateUpdateProductDto -> Product
        CreateMap<CreateUpdateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderProducts, opt => opt.Ignore())
            .ForMember(dest => dest.UserLikes, opt => opt.Ignore());
    }
}