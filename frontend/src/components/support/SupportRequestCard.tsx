import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock3, LifeBuoy, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { supportService, type SupportRequestType } from '../../services/support.service';

interface SupportRequestCardProps {
    bookingOptions?: Array<{ id: string; label: string }>;
}

export const SupportRequestCard: React.FC<SupportRequestCardProps> = ({ bookingOptions = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<SupportRequestType>('SUPPORT');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [bookingId, setBookingId] = useState('');
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { data: requests = [] } = useQuery({
        queryKey: ['mySupportRequests'],
        queryFn: supportService.getMine,
        refetchInterval: 60000,
    });
    const createMutation = useMutation({
        mutationFn: supportService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mySupportRequests'] });
            setIsOpen(false);
            setSubject('');
            setDescription('');
            setBookingId('');
            showToast('Your request was submitted to support.', 'success');
        },
        onError: () => showToast('We could not submit your request. Please try again.', 'error'),
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!subject.trim() || !description.trim()) return;
        createMutation.mutate({ type, subject, description, bookingId: bookingId || undefined });
    };

    const latestRequest = requests[0];
    const statusLabel = latestRequest?.status.replace('_', ' ');

    return (
        <>
            <Card className="border-orange-100 bg-orange-50/70 dark:border-orange-900/30 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                        <LifeBuoy className="h-5 w-5 text-orange-500" />
                        Help & disputes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Need help with a booking or want to report an issue? Our support team can help.</p>
                    {latestRequest && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-white/70 p-3 dark:border-orange-900/30 dark:bg-gray-900/30">
                            {latestRequest.type === 'DISPUTE' ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : <Clock3 className="h-4 w-4 text-orange-500" />}
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{latestRequest.subject}</p><p className="text-xs capitalize text-muted-foreground">{statusLabel}</p></div>
                        </div>
                    )}
                    <Button className="mt-4 w-full" variant="outline" onClick={() => setIsOpen(true)}><Send className="mr-2 h-4 w-4" /> Submit a request</Button>
                </CardContent>
            </Card>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Contact support">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setType('SUPPORT')} className={`rounded-xl border p-3 text-left text-sm transition ${type === 'SUPPORT' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}><LifeBuoy className="mb-1 h-4 w-4" />General support</button>
                        <button type="button" onClick={() => setType('DISPUTE')} className={`rounded-xl border p-3 text-left text-sm transition ${type === 'DISPUTE' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-border text-muted-foreground'}`}><AlertTriangle className="mb-1 h-4 w-4" />Report a dispute</button>
                    </div>
                    {bookingOptions.length > 0 && <select value={bookingId} onChange={(event) => setBookingId(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm"><option value="">Optional booking reference</option>{bookingOptions.map((booking) => <option key={booking.id} value={booking.id}>{booking.label}</option>)}</select>}
                    <input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    <textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell us what happened..." className="min-h-32 w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={createMutation.isPending || !subject.trim() || !description.trim()}>{createMutation.isPending ? 'Submitting...' : 'Submit request'}</Button></div>
                </form>
            </Modal>
        </>
    );
};
