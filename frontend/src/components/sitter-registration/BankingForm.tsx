import React from 'react';
import { useSitterRegistration } from '../../context/SitterRegistrationContext';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Lock } from 'lucide-react';

const BankingForm: React.FC = () => {
    const { data, updateNestedData } = useSitterRegistration();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateNestedData('bankDetails', id, value);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Banking Information</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Your payment details are encrypted and secure.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input
                        id="accountHolderName"
                        placeholder="Full Name on Account"
                        value={data.bankDetails.accountHolderName}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                        id="bankName"
                        placeholder="e.g. Chase, Bank of America"
                        value={data.bankDetails.bankName}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                            id="routingNumber"
                            type="password"
                            placeholder="9 digits"
                            maxLength={9}
                            value={data.bankDetails.routingNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            type="password"
                            placeholder="10-12 digits"
                            value={data.bankDetails.accountNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p>
                        <strong>Note:</strong> In a production environment, this would integrate with a payment processor like Stripe Connect for secure onboarding and payouts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BankingForm;
