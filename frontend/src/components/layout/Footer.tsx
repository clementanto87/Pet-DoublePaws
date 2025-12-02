import React from 'react';
import { Link } from 'react-router-dom';

import { ArrowRight, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

import { Logo } from '../ui/Logo';

const Footer: React.FC = () => {
    return (
        <footer className="bg-background-alt dark:bg-background-alt-dark border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <Logo className="w-12 h-9" />
                            <span className="text-xl font-display font-bold text-gradient">Double Paws</span>
                        </Link>
                        <p className="text-muted-foreground mb-6">
                            Premium pet care services designed to make your furry friends feel right at home. Safe, fun, and loving environment.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, label: 'Facebook' },
                                { icon: Twitter, label: 'Twitter' },
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Youtube, label: 'Youtube' }
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-glow"
                                >
                                    <span className="sr-only">{social.label}</span>
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {['Home', 'About Us', 'Services', 'Pricing', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Services</h3>
                        <ul className="space-y-4">
                            {['Daycare', 'Boarding', 'Grooming', 'Training', 'Veterinary'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-6">Newsletter</h3>
                        <p className="text-muted-foreground mb-4">
                            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                        </p>
                        <form className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-2 bg-primary text-white p-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {new Date().getFullYear()} Double Paws. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="/" className="hover:text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
