using System.Linq.Expressions;
using backend.QueryObjects;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class ProductQueryExtensions
{
    public static IQueryable<Product> Filter(this IQueryable<Product> query, ProductFilter filter, Guid? currentUserId = null)
    {
        if (!string.IsNullOrEmpty(filter.UaName))
            query = query.Where(p => p.UaName.ToLower().Contains(filter.UaName.ToLower()));

        if (!string.IsNullOrEmpty(filter.EnName))
            query = query.Where(p => p.EnName.ToLower().Contains(filter.EnName.ToLower()));
        
        if (!string.IsNullOrEmpty(filter.Description))
            query = query.Where(p => p.Description.ToLower().Contains(filter.Description.ToLower()));
        
        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        
        if (filter.Category.HasValue)
            query = query.Where(p => p.Category == filter.Category.Value);
        
        if (filter.Count.HasValue)
            query = query.Where(p => p.Count >= filter.Count.Value);
        
        if (filter.MinLikes.HasValue)
            query = query.Where(p => p.Likes >= filter.MinLikes.Value);
        
        if (filter.MaxLikes.HasValue)
            query = query.Where(p => p.Likes <= filter.MaxLikes.Value);
        
        if (filter.IsLiked.HasValue && currentUserId.HasValue)
        {
            if (filter.IsLiked.Value)
                query = query.Where(p => p.UserLikes.Any(ul => ul.UserId == currentUserId.Value));
            else
                query = query.Where(p => !p.UserLikes.Any(ul => ul.UserId == currentUserId.Value));
        }
        
        if (filter.Size.HasValue)
            query = query.Where(p => p.Size == filter.Size.Value);
        
        if (filter.Color.HasValue)
            query = query.Where(p => p.Color == filter.Color.Value);

        return query;
    }

    public static IQueryable<Product> Sort(this IQueryable<Product> queryable, SortParams sortParams)
    {
        if (string.IsNullOrEmpty(sortParams.OrderBy))
            return queryable;

        return sortParams.SortDirection == SortDirection.Descending
            ? queryable.OrderByDescending(GetKeySelector(sortParams.OrderBy))
            : queryable.OrderBy(GetKeySelector(sortParams.OrderBy));
    }

    private static Expression<Func<Product, object>> GetKeySelector(string orderBy)
    {
        if (string.IsNullOrEmpty(orderBy))
            return p => p.UaName;

        return orderBy.ToLower() switch
        {
            "uaname" => p => p.UaName,
            "name" or "enname" => p => p.EnName,
            "price" => p => p.Price,
            "category" => p => p.Category,
            "count" or "stock" => p => p.Count,
            "likes" or "popularity" => p => p.Likes,
            "size" => p => p.Size,
            "color" => p => p.Color,
            "description" => p => p.Description,
            _ => p => p.UaName
        };
    }

    public static async Task<PagedResult<Product>> ToPagedAsync(this IQueryable<Product> query, PageParams pageParams)
    {
        var count = await query.CountAsync();
        if (count == 0)
            return new PagedResult<Product>([], 0);
        var page = pageParams.Page ?? 1;
        var pageSize = pageParams?.PageSize ?? 10;
         
        var skip = (page - 1) * pageSize;
        var result = await query.Skip(skip)
            .Take(pageSize)
            .ToArrayAsync();

        return new PagedResult<Product>(result, count);
    }
}