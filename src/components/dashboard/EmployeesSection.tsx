import { useState } from 'react';
import { employees, Employee } from '@/data/mockData';
import { ChartCard } from './ChartCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortField = 'name' | 'performanceScore' | 'satisfactionScore' | 'department';
type SortDirection = 'asc' | 'desc';

export function EmployeesSection() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('performanceScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const departments = ['all', ...new Set(employees.map(e => e.department))];

  const filteredEmployees = employees
    .filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === 'all' || e.department === departmentFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ChartCard 
        title="Employee Directory" 
        subtitle={`${filteredEmployees.length} employees found`}
        delay={0}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th 
                  className="text-left py-4 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-2">
                    Department <SortIcon field="department" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('performanceScore')}
                >
                  <div className="flex items-center gap-2">
                    Performance <SortIcon field="performanceScore" />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort('satisfactionScore')}
                >
                  <div className="flex items-center gap-2">
                    Satisfaction <SortIcon field="satisfactionScore" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                  Training
                </th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr 
                  key={employee.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.yearsAtCompany} years</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary">{employee.department}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            employee.performanceScore >= 80 ? "bg-success" :
                            employee.performanceScore >= 60 ? "bg-warning" : "bg-destructive"
                          )}
                          style={{ width: `${employee.performanceScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{employee.performanceScore}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div 
                          key={star}
                          className={cn(
                            "w-3 h-3 rounded-full",
                            star <= employee.satisfactionScore ? "bg-primary" : "bg-secondary"
                          )}
                        />
                      ))}
                      <span className="font-mono text-sm ml-2">{employee.satisfactionScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm">{employee.trainingHours}h</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      className={cn(
                        "border-0",
                        employee.performanceCategory === 'High' ? "bg-success/20 text-success" :
                        employee.performanceCategory === 'Medium' ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      )}
                    >
                      {employee.performanceCategory}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
