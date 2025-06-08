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
                if (context.TryGetItems(out var items) && 
                    items.ContainsKey("CurrentUserId") && 
                    items["CurrentUserId"] is Guid currentUserId)
                {
                    return src.UserLikes.Any(ul => ul.UserId == currentUserId);
                }
                return false;
            }));

        // CreateUpdateProductDto -> Product
        CreateMap<CreateUpdateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderProducts, opt => opt.Ignore())
            .ForMember(dest => dest.UserLikes, opt => opt.Ignore())
            .ForMember(dest => dest.Likes, opt => opt.Ignore());
    }
}