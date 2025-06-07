using AutoMapper;
using backend.DTOs.Orders;
using backend.Models;

namespace backend.Mappings;

public class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        // Order -> OrderResponseDto
        CreateMap<Order, OrderResponseDto>()
            .ForMember(dest => dest.OrderProducts, opt => opt.MapFrom(src => src.OrderProducts));

        // OrderProduct -> OrderProductResponseDto
        CreateMap<OrderProduct, OrderProductResponseDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.EnName : "Unknown"));

        // CreateOrderDto -> Order
        CreateMap<CreateOrderDto, Order>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.OrderProducts, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());

        // OrderProductDto -> OrderProduct
        CreateMap<OrderProductDto, OrderProduct>()
            .ForMember(dest => dest.OrderId, opt => opt.Ignore())
            .ForMember(dest => dest.PriceAtTime, opt => opt.Ignore())
            .ForMember(dest => dest.Order, opt => opt.Ignore())
            .ForMember(dest => dest.Product, opt => opt.Ignore());
    }
}