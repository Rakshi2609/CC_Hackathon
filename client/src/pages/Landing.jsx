import { Link } from 'react-router-dom';
import { Camera, MapPin, Bell, Shield, BarChart3, Users, Clock, CheckCircle, ArrowRight, Play, Smartphone, Monitor, Zap, Globe } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 min-h-screen flex items-center">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                <div className="container mx-auto px-4 pt-16 lg:pt-24 pb-20 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-sm font-medium text-blue-800">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Live Platform • AI-Powered
                            </div>

                            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                                Smart Civic Issue<br />
                                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Reporting Platform
                                </span>
                            </h1>

                            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                                Empowering citizens to report infrastructure problems while giving government officials
                                real-time visibility and powerful tools to manage, prioritize, and resolve civic issues efficiently.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
                                >
                                    Get Started Free
                                    <ArrowRight size={20} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                >
                                    <Play size={20} />
                                    View Live Demo
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-col sm:flex-row gap-6 pt-8 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Trusted by Cities</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Real-time Updates</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>AI Powered</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative lg:pl-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                                <Camera size={24} className="text-red-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Photo Report</div>
                                                <div className="text-xs text-gray-500">2 min ago</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 mb-3">Pothole detected on MG Road</div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="w-2/3 h-2 bg-red-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <CheckCircle size={24} className="text-green-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Resolved</div>
                                                <div className="text-xs text-gray-500">1 hour ago</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">Street light fixed successfully</div>
                                    </div>
                                </div>

                                <div className="space-y-6 mt-12">
                                    <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                                <MapPin size={24} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Geo-Clustered</div>
                                                <div className="text-xs text-gray-500">5 min ago</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-700">3 similar reports merged</div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-blue-500">
                                        <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Priority Alert</div>
                                        <div className="text-sm font-medium text-gray-700">Traffic signal malfunction detected</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-200 opacity-10 rounded-full flex items-center justify-center animate-pulse">
                                <Zap size={48} className="text-blue-500 opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            A simple, streamlined process from problem identification to resolution
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Camera size={40} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Capture Issue</h3>
                            <p className="text-gray-600 leading-relaxed">Take a photo, add location, describe the problem in seconds</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 size={40} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Verification</h3>
                            <p className="text-gray-600 leading-relaxed">System validates photos and automatically prioritizes issues</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield size={40} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Government Action</h3>
                            <p className="text-gray-600 leading-relaxed">Officials review, assign resources, and begin resolution</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell size={40} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
                            <p className="text-gray-600 leading-relaxed">Get instant notifications on progress and resolution</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Powerful Features</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Everything you need to report issues and manage civic problems efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Camera,
                                title: 'Photo Evidence',
                                description: 'Capture clear images with GPS location tagging and AI verification to prevent false reports',
                                color: 'blue'
                            },
                            {
                                icon: MapPin,
                                title: 'Smart Clustering',
                                description: 'Automatically groups similar nearby reports to prevent duplicate work and identify hotspots',
                                color: 'green'
                            },
                            {
                                icon: BarChart3,
                                title: 'Priority Scoring',
                                description: 'AI-driven urgency assessment helps governments allocate resources to critical issues first',
                                color: 'purple'
                            },
                            {
                                icon: Bell,
                                title: 'Live Notifications',
                                description: 'Real-time updates keep citizens informed about report status from submission to resolution',
                                color: 'red'
                            },
                            {
                                icon: Users,
                                title: 'Transparency',
                                description: 'Complete audit trail and status tracking builds trust between citizens and government',
                                color: 'orange'
                            },
                            {
                                icon: Clock,
                                title: 'Fast Processing',
                                description: 'Submit issues in seconds with mobile-first design optimized for quick reporting',
                                color: 'indigo'
                            }
                        ].map((feature) => (
                            <div key={feature.title} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
                                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon className={`text-${feature.color}-600`} size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases - Real World Impact */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Real-World Impact</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            See how CivicPlus improves outcomes for citizens and governments
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                            <Smartphone className="text-blue-600 mb-4" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Citizens Report Faster</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Mobile-first design enables citizens to submit detailed reports with photos and GPS in under 30 seconds
                            </p>
                            <div className="text-sm font-bold text-blue-600">Average: 2.5s to submit</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                            <BarChart3 className="text-green-600 mb-4" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Government Responds Smarter</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                AI clustering and priority scoring helps officials focus on most critical issues and eliminate duplicate work
                            </p>
                            <div className="text-sm font-bold text-green-600">Up to 85% duplicate reduction</div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                            <Users className="text-orange-600 mb-4" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Communities Stay Informed</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Real-time updates and full transparency build trust and accountability between citizens and local government
                            </p>
                            <div className="text-sm font-bold text-orange-600">100% transparent tracking</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Common Questions</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    question: 'How do I report an issue?',
                                    answer: 'Simply take a photo of the problem, select the category, add a description, and our system automatically captures your location and submits the report.'
                                },
                                {
                                    question: 'Is there a cost to use CivicPlus?',
                                    answer: 'CivicPlus is completely free for all citizens. Government organizations can contact us for enterprise deployment options.'
                                },
                                {
                                    question: 'How does the AI verification work?',
                                    answer: 'Our AI system analyzes your photos for authenticity, automatically categorizes the issue type, and assigns a priority score based on severity and location.'
                                },
                                {
                                    question: 'Can I track my reported issues?',
                                    answer: 'Yes! You get real-time notifications and can track your issues through our dashboard from submission all the way through resolution.'
                                },
                                {
                                    question: 'How is my data protected?',
                                    answer: 'We use industry-standard encryption, secure authentication, and strict data privacy policies. Your information is never shared with third parties.'
                                }
                            ].map((faq, index) => (
                                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 lg:py-28 bg-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">
                        Transform Your City Today
                    </h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of citizens reporting issues and government officials managing them more efficiently with CivicPlus
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg"
                        >
                            Start Reporting
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-400 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                            Government Access
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}