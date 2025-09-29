import React, { useState, useMemo } from 'react';
import { Users, Plus, Upload, UserCheck, UserX, UserMinus, MoreVertical } from 'lucide-react';
import { students as initialStudents } from '../data/students';
import { Student } from '../types';
import { track } from '../analytics/track';
import useLocalStorage from '../hooks/useLocalStorage';
import { useDebounce } from '../hooks/useDebounce';

// New Architecture Components
import ModulePage from '../layouts/ModulePage';
import FilterBar from '../ui/FilterBar';
import Table from '../ui/Table';
import Drawer from '../ui/Drawer';
import BulkBar from '../ui/BulkBar';
import KpiCard from '../components/ui/KpiCard';
import StatusTag from '../ui/StatusTag';
import IconButton from '../ui/IconButton';
import Button from '../ui/Button';

type EnrollmentFilter = {
    type: 'status' | 'grade' | 'text';
    value: string;
    label: string;
};

const MatriculaPage: React.FC = () => {
    const [students] = useState<Student[]>(initialStudents);
    const [filters, setFilters] = useLocalStorage<EnrollmentFilter[]>('matricula.filters', []);
    const debouncedFilters = useDebounce(filters, 300);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    const summary = useMemo(() => ({
        matriculados: students.filter(s => s.enrollmentStatus === 'Matriculado').length,
        trasladados: students.filter(s => s.enrollmentStatus === 'Trasladado').length,
        retirados: students.filter(s => s.enrollmentStatus === 'Retirado').length,
    }), [students]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            return debouncedFilters.every(filter => {
                if (filter.type === 'status') return s.enrollmentStatus === filter.value;
                if (filter.type === 'grade') return s.grade === filter.value;
                if (filter.type === 'text') {
                    return s.fullName.toLowerCase().includes(filter.value.toLowerCase()) || s.documentNumber.includes(filter.value);
                }
                return true;
            });
        });
    }, [students, debouncedFilters]);
    
    const handleNewEnrollment = () => {
        track('enrollment_start');
        setIsDrawerOpen(true);
    };

    const columns = [
        { key: 'fullName', header: 'Nombre', sortable: true, render: (s: Student) => (
            <div className="flex items-center gap-3">
                <img src={s.avatarUrl} alt={s.fullName} className="w-10 h-10 rounded-full" />
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{s.fullName.toLowerCase()}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">{s.documentNumber}</span>
                </div>
            </div>
        ), className: 'sticky left-12 min-w-64 z-10' },
        { key: 'grade', header: 'Grado y Sección', sortable: true, render: (s: Student) => `${s.grade} "${s.section}"` },
        { key: 'enrollmentStatus', header: 'Estado', sortable: true, render: (s: Student) => <StatusTag status={s.enrollmentStatus as any} /> },
        { key: 'actions', header: 'Acciones', render: (s: Student) => (
            <IconButton aria-label="Más acciones" variant="tertiary" icon={MoreVertical} />
        ), className: 'text-center sticky right-0' }
    ];

    return (
        <>
        <ModulePage
            title="Gestión de Matrícula"
            description="Administre el proceso de matrícula, vacantes, traslados y retiros."
            icon={Users}
            kpis={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Matriculados" value={summary.matriculados} icon={UserCheck} />
                    <KpiCard title="Trasladados" value={summary.trasladados} icon={UserMinus} />
                    <KpiCard title="Retirados" value={summary.retirados} icon={UserX} />
                </div>
            }
            actionsRight={
                <>
                    <Button variant="secondary" aria-label="Importar desde SIAGIE" icon={Upload}>Importar SIAGIE</Button>
                    <Button variant="primary" aria-label="Nueva Matrícula" icon={Plus} onClick={handleNewEnrollment}>Nueva Matrícula</Button>
                </>
            }
            filters={
                <FilterBar
                    activeFilters={filters.map(f => ({ id: `${f.type}-${f.value}`, label: f.label }))}
                    onRemoveFilter={(id) => setFilters(prev => prev.filter(f => `${f.type}-${f.value}` !== id))}
                    onClearAll={() => setFilters([])}
                />
            }
            content={
                <Table
                    columns={columns}
                    rows={filteredStudents}
                    getRowId={(s) => s.documentNumber}
                    sortConfig={null}
                    onSort={() => {}}
                    selectable
                    selectedRowIds={selectedRowIds}
                    onSelect={(id) => {
                        setSelectedRowIds(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(id as string)) newSet.delete(id as string);
                            else newSet.add(id as string);
                            return newSet;
                        });
                    }}
                    onSelectAll={(isSelected) => {
                        setSelectedRowIds(isSelected ? new Set(filteredStudents.map(s => s.documentNumber)) : new Set());
                    }}
                />
            }
            bulkBar={
                 <BulkBar selectedCount={selectedRowIds.size} onClear={() => setSelectedRowIds(new Set())}>
                    <IconButton aria-label="Marcar como trasladado" icon={UserMinus} />
                    <IconButton aria-label="Marcar como retirado" icon={UserX} />
                </BulkBar>
            }
        />
        <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="Nueva Matrícula (Wizard)"
        >
            <p>Aquí iría el wizard de 4 pasos con autosave para la nueva matrícula.</p>
        </Drawer>
        </>
    );
};

export default MatriculaPage;
