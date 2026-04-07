import { useState } from 'react';
import { Button, Field, Label, FieldGroup, Select, Input, ErrorMessage } from './catalyst';
import TrackurWordmark from './TrackurWordmark.jsx';
import { Checkbox } from './catalyst';
import { COUNTRIES } from '../constants/countries.js';
import IndustryMultiSelect from './IndustryMultiSelect.jsx';
import TagInput from './TagInput.jsx';
import profileService from '../services/profileService.js';
import { CHAR_LIMITS } from '../constants.js';

export default function AccountSetupScreen({ user, onComplete }) {
  const [stage, setStage] = useState(1);
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    country: '',
    agreedToTerms: false,
    industries: [],
    jobTitles: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const updateValue = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Clear field error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleNext = () => {
    const newErrors = {};
    if (!values.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!values.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!values.country) newErrors.country = 'Please select your country';
    if (!values.agreedToTerms) newErrors.agreedToTerms = 'You must agree to continue';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStage(2);
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setErrors({});

    try {
      await profileService.createProfile({
        id: user.id,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        country: values.country,
        agreedToTerms: true,
        agreedAt: new Date().toISOString(),
        industries: values.industries,
        jobTitles: values.jobTitles,
        setupComplete: true,
      });
      await onComplete();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-200 px-4 py-8 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        {/* Branding */}
        <div className="mb-6 flex justify-center">
          <TrackurWordmark size="lg" />
        </div>

        <h2 className="mb-1 text-center text-lg font-semibold text-zinc-950 dark:text-white">
          Complete your account
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Step {stage} of 2
        </p>

        {/* Step indicator */}
        <div className="mb-6 flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${stage >= 1 ? 'bg-mauve-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
          <div className={`h-1 flex-1 rounded-full ${stage >= 2 ? 'bg-mauve-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
        </div>

        {stage === 1 && (
          <div>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    name="firstName"
                    required
                    maxLength={CHAR_LIMITS.firstName}
                    value={values.firstName}
                    onChange={(e) => updateValue('firstName', e.target.value)}
                    placeholder="First name"
                  />
                  {values.firstName.length >= CHAR_LIMITS.firstName && (
                    <span className="text-[11px] text-red-500 dark:text-red-400">Max {CHAR_LIMITS.firstName} characters.</span>
                  )}
                  {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                </Field>
                <Field>
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    name="lastName"
                    required
                    maxLength={CHAR_LIMITS.lastName}
                    value={values.lastName}
                    onChange={(e) => updateValue('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                  {values.lastName.length >= CHAR_LIMITS.lastName && (
                    <span className="text-[11px] text-red-500 dark:text-red-400">Max {CHAR_LIMITS.lastName} characters.</span>
                  )}
                  {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                </Field>
              </div>
              <Field>
                <Label>Country</Label>
                <Select
                  name="country"
                  value={values.country}
                  onChange={(e) => updateValue('country', e.target.value)}
                  autocomplete="on"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
                {errors.country && <ErrorMessage>{errors.country}</ErrorMessage>}
              </Field>
            </FieldGroup>

            {/* Terms checkbox */}
            <div className="mt-5">
              <div
                data-slot="field"
                className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 cursor-pointer"
                onClick={() => updateValue('agreedToTerms', !values.agreedToTerms)}
              >
                <Checkbox
                  checked={values.agreedToTerms}
                  onChange={(checked) => updateValue('agreedToTerms', checked)}
                />
                <span data-slot="label" className="text-base/6 text-zinc-950 select-none sm:text-sm/6 dark:text-white">
                  I agree to the{' '}
                  <span className="text-mauve-600 dark:text-mauve-400">Privacy Policy</span>
                  {' '}and{' '}
                  <span className="text-mauve-600 dark:text-mauve-400">Terms and Conditions</span>
                </span>
              </div>
              {errors.agreedToTerms && (
                <p className="mt-1 ml-8 text-sm text-red-600 dark:text-red-400">{errors.agreedToTerms}</p>
              )}
            </div>

            {errors.submit && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            )}

            <Button
              color="violet"
              className="mt-6 w-full"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        )}

        {stage === 2 && (
          <div>
            <FieldGroup>
              <div data-slot="field">
                <span data-slot="label" className="text-base/6 font-medium text-zinc-950 select-none sm:text-sm/6 dark:text-white">Which industries are you job hunting in?</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Optional — select all that apply</p>
                <IndustryMultiSelect
                  value={values.industries}
                  onChange={(v) => updateValue('industries', v)}
                />
              </div>
              <div data-slot="field">
                <span data-slot="label" className="text-base/6 font-medium text-zinc-950 select-none sm:text-sm/6 dark:text-white">Which job titles are you targeting?</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Optional — type a title and press Enter</p>
                <TagInput
                  name="jobTitles"
                  value={values.jobTitles}
                  onChange={(v) => updateValue('jobTitles', v)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </FieldGroup>

            {errors.submit && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            )}

            <div className="mt-6 flex gap-3">
              <Button plain className="flex-1" onClick={() => setStage(1)}>
                Back
              </Button>
              <Button
                color="violet"
                className="flex-1"
                onClick={handleComplete}
                disabled={submitting}
              >
                {submitting ? 'Completing...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
