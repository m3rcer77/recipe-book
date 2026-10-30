import { Card, CardContent, Skeleton } from '@mui/material'

/** Заглушка сетки карточек на время загрузки. */
export function RecipeGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="recipe-grid">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="recipe-card">
          <Skeleton variant="rectangular" height={175} animation="wave" />
          <CardContent className="recipe-content">
            <Skeleton width="40%" height={26} />
            <Skeleton width="85%" height={32} />
            <Skeleton width="100%" />
            <Skeleton width="70%" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
