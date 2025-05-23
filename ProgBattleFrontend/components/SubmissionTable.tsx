"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSubmissions } from "@/lib/api"
export type Submission = {
  submission_id: string
  bot_name: string
  submitted_by: string
  timestamp: string
  //   result: "win" | "loss" | "draw"
  score: string
  status: "evaluated" | "running" | "failed"
}



export function SubmissionsTable() {
  
const [open, setOpen] = React.useState(false);
const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<string | null>(null);
const [selectedCode, setSelectedCode] = React.useState<string | null>(null);
const submissionColumns: ColumnDef<Submission>[] = [
  {
    accessorKey: "submission_id",
    header: "Submission ID",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("submission_id")}</div>,
  },
  {
    accessorKey: "bot_name",
    header: "Bot Name",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("bot_name")}</div>,
},
{
    accessorKey: "score",
    header: "Score",
},
{
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
},
{
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) => <div>{new Date(row.getValue("created_at")).toLocaleString()}</div>,
},
{
  id: "actions",
  enableHiding: false,
  cell: ({ row }) => {
    const submission = row.original;
    return (<>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(submission.submission_id)}>
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedSubmissionId(submission.submission_id)}>
            View Logs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {setSelectedCode(submission.submission_id); setOpen(true)}}>
            Edit Bot
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    {selectedSubmissionId && (
      <MatchesDialog
        submission_id={selectedSubmissionId}
        open={!!selectedSubmissionId}
        setOpen={(open) => !open ? setSelectedSubmissionId(null) : null}
      />
    )}
    {
      selectedCode && (

      <SubmissionDialog submission_id={selectedCode} open={open} setOpen={setOpen}/>
      )
    }
</>      
  
  );
  },
},

]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    React.useEffect(() => {
        const fetchSubmissions = async () => {
        const data = await getSubmissions();
        setSubmissions(data.submissions);
    
        };

        fetchSubmissions();
    }, []
    );
  const table = useReactTable({
    data: submissions,
    columns: submissionColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name..."
          value={(table.getColumn("bot_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("bot_name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value: any) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={submissionColumns.length} className="h-24 text-center">
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogsTable } from "./LogsTable"
import { SubmissionDialog } from "./SubmissionEdit"


export function MatchesDialog({submission_id, open, setOpen} : {submission_id: string, open: boolean, setOpen: (Open: boolean) => void}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">View Matches</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Match Results</DialogTitle>
          <DialogDescription>
            These are the results of all rounds with all system bots with this submission.
          </DialogDescription>
        </DialogHeader>

        <LogsTable submission_id={submission_id} />
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}