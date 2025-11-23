import React from 'react';
import Skeleton from '../Skeleton';

export default function SkeletonChip({ width = 80 }: { width?: number }) {
  return <Skeleton width={width} height={28} borderRadius={14} shimmer />;
}
