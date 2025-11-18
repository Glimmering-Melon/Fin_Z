import React from 'react';

interface AlertBadgeProps {
  severity: 'low' | 'medium' | 'high';
}

export default function AlertBadge({ severity }: AlertBadgeProps) {
  // TODO: Color-coded badge based on severity
  return <span>{severity}</span>;
}
