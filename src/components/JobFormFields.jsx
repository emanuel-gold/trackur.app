import { STAGES } from '../constants.js';
import { Field, FieldGroup, Label, Input, Select, Textarea } from './catalyst';

export default function JobFormFields({ values, onChange }) {
  const field = (name) => ({
    value: values[name] || '',
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <FieldGroup className="space-y-4">
      <Field>
        <Label>Company Name *</Label>
        <Input type="text" required placeholder="e.g. HubSpot" {...field('company')} />
      </Field>

      <Field>
        <Label>Role *</Label>
        <Input type="text" required placeholder="e.g. Frontend Developer" {...field('role')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>Date Applied</Label>
          <Input type="date" {...field('dateApplied')} />
        </Field>

        <Field>
          <Label>Stage</Label>
          <Select {...field('stage')}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <Label>First Step</Label>
          <Input type="text" placeholder="e.g. Follow up with recruiter" {...field('firstStep')} />
        </Field>

        <Field>
          <Label>Due Date</Label>
          <Input type="date" {...field('firstStepDate')} />
        </Field>
      </div>

      <Field>
        <Label>Notes</Label>
        <Textarea rows={3} resizable={false} placeholder="Add notes, to-do items, or anything else." {...field('notes')} />
      </Field>
    </FieldGroup>
  );
}
