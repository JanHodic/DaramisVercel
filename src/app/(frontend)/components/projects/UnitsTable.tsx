"use client";

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ScrollArea } from '../../components/ui/scroll-area';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { X, ArrowLeft, RotateCcw, Scale, Home, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UIUnit, UIUnitStatus } from '../../mappers/UITypes';

interface UnitsTableProps {
  units: UIUnit[];
  projectId: string;
}

export function UnitsTable({ units, projectId }: UnitsTableProps) {
  const { t } = useLanguage();

  // Filters state
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UIUnitStatus | 'all'>('available');
  const [dispositionFilter, setDispositionFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  // Sorting state
  type SortColumn = 'name' | 'floor' | 'building' | 'size' | 'disposition' | 'price' | 'status';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Selection and comparison state
  const [selectedUnits, setSelectedUnits] = useState<UIUnit[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Unit detail - now shows PDF fullscreen directly
  const [selectedUnit, setSelectedUnit] = useState<UIUnit | null>(null);

  // Get unique values for filters
  const floors = useMemo(() => [...new Set(units.map(u => u.floor))].sort((a, b) => a - b), [units]);
  const buildings = useMemo(() => [...new Set(units.map(u => u.building))].sort(), [units]);
  const dispositions = useMemo(() => [...new Set(units.map(u => u.disposition))], [units]);

  // Price range
  const minPrice = useMemo(() => Math.min(...units.map(u => u.price)), [units]);
  const maxPrice = useMemo(() => Math.max(...units.map(u => u.price)), [units]);

  // Auto-exit comparison mode when less than 2 units selected
  useEffect(() => {
    if (isComparing && selectedUnits.length < 2) {
      setIsComparing(false);
    }
  }, [selectedUnits.length, isComparing]);

  // Filtered and sorted units
  const filteredUnits = useMemo(() => {
    let result = units.filter(unit => {
      if (floorFilter !== 'all' && unit.floor !== parseInt(floorFilter)) return false;
      if (buildingFilter !== 'all' && unit.building !== buildingFilter) return false;
      if (statusFilter !== 'all' && unit.status !== statusFilter) return false;
      if (dispositionFilter !== 'all' && unit.disposition !== dispositionFilter) return false;

      const priceMin = minPrice + (priceRange[0] / 100) * (maxPrice - minPrice);
      const priceMax = minPrice + (priceRange[1] / 100) * (maxPrice - minPrice);
      if (unit.price < priceMin || unit.price > priceMax) return false;

      return true;
    });

    // Apply sorting
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        switch (sortColumn) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'floor':
            comparison = a.floor - b.floor;
            break;
          case 'building':
            comparison = a.building.localeCompare(b.building);
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'disposition':
            comparison = a.disposition.localeCompare(b.disposition);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'status':
            const statusOrder = { available: 0, reserved: 1, sold: 2 };
            comparison = statusOrder[a.status] - statusOrder[b.status];
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [units, floorFilter, buildingFilter, statusFilter, dispositionFilter, priceRange, minPrice, maxPrice, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const toggleUnitSelection = (unit: UIUnit) => {
    setSelectedUnits(prev => {
      const isSelected = prev.some(u => u.id === unit.id);
      if (isSelected) {
        return prev.filter(u => u.id !== unit.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, unit];
    });
  };

  const resetFilters = () => {
    setFloorFilter('all');
    setBuildingFilter('all');
    setStatusFilter('available');
    setDispositionFilter('all');
    setPriceRange([0, 100]);
    setSelectedUnits([]);
    setSortColumn(null);
    setSortDirection('asc');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: UIUnitStatus) => {
    const variants: Record<UIUnitStatus, { className: string; label: string }> = {
      available: {
        className: 'bg-green-100 text-green-800 border-green-200',
        label: t('units.available'),
      },
      reserved: {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: t('units.reserved'),
      },
      sold: {
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        label: t('units.sold'),
      },
    };
    return variants[status];
  };

  // Comparison View
  if (isComparing) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsComparing(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('units.backToList')}
            </Button>
            <h2 className="text-xl font-heading">{t('units.compareUnits')}</h2>
            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Comparison Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 w-40 sticky left-0 bg-background z-10">
                      {/* Parameter labels column */}
                    </th>
                    {selectedUnits.map(unit => (
                      <th key={unit.id} className="p-4 min-w-[200px]">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 z-10"
                            onClick={() => toggleUnitSelection(unit)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {/* Floor Plan Placeholder */}
                          <AspectRatio ratio={4 / 3} className="bg-gradient-to-br from-daramis-bg to-daramis-green-100 rounded-lg overflow-hidden mb-4">
                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                              <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: 'linear-gradient(#004C45 1px, transparent 1px), linear-gradient(90deg, #004C45 1px, transparent 1px)',
                                backgroundSize: '16px 16px'
                              }} />
                              <Home className="w-10 h-10 text-primary/40" strokeWidth={1} />
                              <p className="mt-2 text-xs text-muted-foreground">Půdorys</p>
                            </div>
                          </AspectRatio>
                          <h3 className="text-lg font-bold">{unit.name}</h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium sticky left-0 bg-background">{t('units.disposition')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">{unit.disposition}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-border bg-muted/50">
                    <td className="p-4 font-medium sticky left-0 bg-muted/50">{t('units.size')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">{unit.size} {t('units.sqm')}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium sticky left-0 bg-background">{t('units.floor')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">{unit.floor}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-border bg-muted/50">
                    <td className="p-4 font-medium sticky left-0 bg-muted/50">{t('units.building')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">{unit.building}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium sticky left-0 bg-background">{t('units.balcony')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">
                        {unit.balconyArea ? `${unit.balconyArea} ${t('units.sqm')}` : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border bg-muted/50">
                    <td className="p-4 font-medium sticky left-0 bg-muted/50">{t('units.terrace')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">
                        {unit.gardenArea ? `${unit.gardenArea} ${t('units.sqm')}` : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium sticky left-0 bg-background">{t('units.orientation')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center">
                        {unit.orientation || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4 font-medium sticky left-0 bg-background">{t('units.status')}</td>
                    {selectedUnits.map(unit => {
                      const badge = getStatusBadge(unit.status);
                      return (
                        <td key={unit.id} className="p-4 text-center">
                          <Badge className={badge.className}>{badge.label}</Badge>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-t border-border bg-primary/5">
                    <td className="p-4 font-bold sticky left-0 bg-primary/5">{t('units.price')}</td>
                    {selectedUnits.map(unit => (
                      <td key={unit.id} className="p-4 text-center font-bold text-lg">
                        {formatPrice(unit.price)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-border bg-card">
        <div className="flex items-end gap-3">
          {/* Floor Filter */}
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="flex-1 min-w-0">
              <SelectValue placeholder={t('units.floor')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechna podlaží</SelectItem>
              {floors.map(floor => (
                <SelectItem key={floor} value={floor.toString()}>
                  {floor}. podlaží
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Building Filter */}
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="flex-1 min-w-0">
              <SelectValue placeholder={t('units.building')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny budovy</SelectItem>
              {buildings.map(building => (
                <SelectItem key={building} value={building}>
                  {building}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Disposition Filter */}
          <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
            <SelectTrigger className="flex-1 min-w-0">
              <SelectValue placeholder={t('units.disposition')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny dispozice</SelectItem>
              {dispositions.map(disp => (
                <SelectItem key={disp} value={disp}>
                  {disp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UIUnitStatus | 'all')}>
            <SelectTrigger className="flex-1 min-w-0">
              <SelectValue placeholder={t('units.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny stavy</SelectItem>
              <SelectItem value="available">{t('units.available')}</SelectItem>
              <SelectItem value="reserved">{t('units.reserved')}</SelectItem>
              <SelectItem value="sold">{t('units.sold')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="flex-[1.5] min-w-0 ml-3">
            <div className="text-xs text-muted-foreground mb-1">{t('units.priceRange')}</div>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatPrice(minPrice + (priceRange[0] / 100) * (maxPrice - minPrice))}</span>
              <span>{formatPrice(minPrice + (priceRange[1] / 100) * (maxPrice - minPrice))}</span>
            </div>
          </div>

          {/* Reset Button */}
          <Button variant="outline" onClick={resetFilters} size="icon" className="h-10 w-10 flex-shrink-0 ml-3">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 pb-20">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      {t('units.name')}
                      <SortIcon column="name" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('floor')}
                  >
                    <div className="flex items-center">
                      {t('units.floor')}
                      <SortIcon column="floor" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('building')}
                  >
                    <div className="flex items-center">
                      {t('units.building')}
                      <SortIcon column="building" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('size')}
                  >
                    <div className="flex items-center">
                      {t('units.size')}
                      <SortIcon column="size" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('disposition')}
                  >
                    <div className="flex items-center">
                      {t('units.disposition')}
                      <SortIcon column="disposition" />
                    </div>
                  </TableHead>
                  <TableHead>{t('units.balcony')}</TableHead>
                  <TableHead>{t('units.terrace')}</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      {t('units.price')}
                      <SortIcon column="price" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      {t('units.status')}
                      <SortIcon column="status" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map(unit => {
                  const isSelected = selectedUnits.some(u => u.id === unit.id);
                  const badge = getStatusBadge(unit.status);

                  return (
                    <TableRow
                      key={unit.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected && "bg-primary/5"
                      )}
                      onClick={() => setSelectedUnit(unit)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUnitSelection(unit)}
                          disabled={!isSelected && selectedUnits.length >= 4}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>{unit.floor}</TableCell>
                      <TableCell>{unit.building}</TableCell>
                      <TableCell>{unit.size} {t('units.sqm')}</TableCell>
                      <TableCell>{unit.disposition}</TableCell>
                      <TableCell>
                        {unit.balconyArea ? `${unit.balconyArea} ${t('units.sqm')}` : '-'}
                      </TableCell>
                      <TableCell>
                        {unit.gardenArea ? `${unit.gardenArea} ${t('units.sqm')}` : '-'}
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(unit.price)}</TableCell>
                      <TableCell>
                        <Badge className={badge.className}>{badge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredUnits.map(unit => {
              const isSelected = selectedUnits.some(u => u.id === unit.id);
              const badge = getStatusBadge(unit.status);

              return (
                <Card
                  key={unit.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedUnit(unit)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUnitSelection(unit)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={!isSelected && selectedUnits.length >= 2}
                        />
                        <CardTitle className="text-lg">{unit.name}</CardTitle>
                      </div>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('units.disposition')}:</span>{' '}
                        <span className="font-medium">{unit.disposition}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('units.size')}:</span>{' '}
                        <span className="font-medium">{unit.size} {t('units.sqm')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('units.floor')}:</span>{' '}
                        <span className="font-medium">{unit.floor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('units.building')}:</span>{' '}
                        <span className="font-medium">{unit.building}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-lg font-bold">{formatPrice(unit.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Floating Compare Button - Left Side */}
      {selectedUnits.length >= 2 && (
        <div className="fixed bottom-6 left-6 md:left-72 z-50">
          <Button
            size="lg"
            onClick={() => setIsComparing(true)}
            className="gap-2 shadow-lg"
          >
            <Scale className="h-5 w-5" />
            {t('units.compare')} ({selectedUnits.length})
          </Button>
        </div>
      )}

      {/* Fullscreen PDF Card View - displays when clicking on a unit */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
            onClick={() => setSelectedUnit(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          {/* Display PDF as image (floorPlan or floorPlanPdf) */}
          <img
            src={selectedUnit.floorPlanPdf || selectedUnit.floorPlan || `https://picsum.photos/seed/unit-${selectedUnit.id}/1920/1080`}
            alt={`Karta jednotky ${selectedUnit.name}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
