ALTER TABLE public.checklist_items 
ADD COLUMN status text NOT NULL DEFAULT 'done';

-- Update existing rows to 'done'
UPDATE public.checklist_items SET status = 'done' WHERE status = 'done';