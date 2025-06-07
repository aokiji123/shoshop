using AutoMapper;
using backend.DTOs.Products;
using backend.Models;

namespace backend.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        // Product -> ProductDto
        CreateMap<Product, ProductDto>();

        // CreateUpdateProductDto -> Product
        CreateMap<CreateUpdateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderProducts, opt => opt.Ignore());
    }
}