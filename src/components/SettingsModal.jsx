import { Fragment, useState, useCallback } from 'react';
import { Dialog, DialogBackdrop, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { Switch, SwitchField } from './catalyst';
import { Button } from './catalyst';
import profileService from '../services/profileService.js';

export default function SettingsModal({ open, onClose, user, profile, refreshProfile, notificationsSupported, permissionState, requestPermission }) {
  const [saving, setSaving] = useState(false);

  const updatePref = useCallback(async (key, value) => {
    if (!profile) return;
    setSaving(true);
    try {
      await profileService.updateProfile({ id: profile.id, [key]: value });
      await refreshProfile();
    } catch {
      // silently fail — preference will reset on next load
    } finally {
      setSaving(false);
    }
  }, [profile, refreshProfile]);

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // Ensure all toggles are on by default when first enabling
      if (profile && !profile.notifyDueToday && !profile.notifyOverdue && !profile.notifyDueTomorrow) {
        await profileService.updateProfile({
          id: profile.id,
          notifyDueToday: true,
          notifyOverdue: true,
          notifyDueTomorrow: true,
        });
        await refreshProfile();
      }
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full md:pl-16">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="pointer-events-auto w-screen max-w-full md:max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/10 dark:ring-white/10">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-950/5 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                          Settings
                        </h2>
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-sm p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/5 transition-colors"
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
                      {/* Account section */}
                      <section>
                        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                          Account
                        </h3>
                        <div className="space-y-2">
                          {profile?.firstName && (
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">Name</p>
                              <p className="text-sm text-zinc-950 dark:text-white">
                                {profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ''}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Email</p>
                            <p className="text-sm text-zinc-950 dark:text-white">{user?.email}</p>
                          </div>
                        </div>
                      </section>

                      {/* Notifications section */}
                      <section>
                        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                          Notifications
                        </h3>

                        {!notificationsSupported ? (
                          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 p-4">
                            <div className="flex items-start gap-3">
                              <BellSlashIcon className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                  Browser notifications are not supported in this browser.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : permissionState === 'denied' ? (
                          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 p-4">
                            <div className="flex items-start gap-3">
                              <BellSlashIcon className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                  Notifications are blocked.
                                </p>
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  To enable, allow notifications for this site in your browser.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : permissionState !== 'granted' ? (
                          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-950/5 dark:ring-white/5 p-4">
                            <div className="flex items-start gap-3">
                              <BellIcon className="size-5 text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                  Get reminders when to-do steps are due.
                                </p>
                                <Button
                                  color="violet"
                                  className="mt-3"
                                  onClick={handleEnableNotifications}
                                >
                                  Enable notifications
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              We&apos;ll notify you when the app is open and to-do steps need attention.
                            </p>

                            <SwitchField>
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-medium text-zinc-950 dark:text-white">Due today</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Get notified when a step is due today
                                  </p>
                                </div>
                                <Switch
                                  color="violet"
                                  checked={profile?.notifyDueToday ?? true}
                                  onChange={(val) => updatePref('notifyDueToday', val)}
                                  disabled={saving}
                                />
                              </div>
                            </SwitchField>

                            <SwitchField>
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-medium text-zinc-950 dark:text-white">Overdue</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Get notified about past-due steps
                                  </p>
                                </div>
                                <Switch
                                  color="violet"
                                  checked={profile?.notifyOverdue ?? true}
                                  onChange={(val) => updatePref('notifyOverdue', val)}
                                  disabled={saving}
                                />
                              </div>
                            </SwitchField>

                            <SwitchField>
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-medium text-zinc-950 dark:text-white">Due tomorrow</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Get a heads-up the day before a step is due
                                  </p>
                                </div>
                                <Switch
                                  color="violet"
                                  checked={profile?.notifyDueTomorrow ?? true}
                                  onChange={(val) => updatePref('notifyDueTomorrow', val)}
                                  disabled={saving}
                                />
                              </div>
                            </SwitchField>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                </div>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
