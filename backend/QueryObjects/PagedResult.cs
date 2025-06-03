namespace backend.QueryObjects;

public class PagedResult<T>
{
    public T[] Data { get; }
    public int TotalCount { get; }

    public PagedResult(T[] data, int totalCount)
    {
        Data = data;
        TotalCount = totalCount;
    }
}