import React from 'react';
import { 
  FileText, 
  Share2, 
  HelpCircle, 
  FolderOpen, 
  FileQuestion,
  Calendar1,
  Network,
  CreditCard
} from 'lucide-react';

const NavigationCards = () => {

  const cards = [
    {
      id: 1,
      title: 'NOC Application',
      description: 'Apply for and track your No Objection Certificate requests.',
      icon: FileText,
      path: '/sdashboard/noc',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Shared Experiences',
      description: 'Read placement stories and interview experiences shared by seniors.',
      icon: Share2,
      path: '/sdashboard/shared-experience',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 3,
      title: 'Question Bank',
      description: 'Access asked interview questions and company-specific practice sets.',
      icon: FileQuestion,
      path: '/sdashboard/question-bank',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 4,
      title: 'Relevant Documents',
      description: 'Download official placement-related forms, templates, and circulars.',
      icon: FolderOpen,
      path: '/sdashboard/student-documents',
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 5,
      title: 'Request Help',
      description: 'Raise queries or request assistance from the placement team.',
      icon: HelpCircle,
      path: '/sdashboard/request-help',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 6,
      title: 'Placement Calendar',
      description: 'Stay updated on college placements schedules.',
      icon: Calendar1,
      path: '/sdashboard/placement-calendar',
      color: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      id: 7,
      title: 'Student Connect',
      description: 'Connect with placed students and peers for insights and guidance.',
      icon: Network,
      path: '/sdashboard/student-connect',
      color: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    // {
    // id: 8,
    // title: 'Fine Payment',
    // description: 'Pay your fine and track your payment status.',
    // icon: CreditCard,
    // path: '/sdashboard/fine-payment',
    // color: 'bg-red-50',
    // iconColor: 'text-red-600'
    // },
  ];

  const handleCardClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-black">Important</span>{' '}
            <span className="text-custom-blue">Links</span>
          </h1>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.path)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left border border-gray-200 hover:border-custom-blue transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {/* Icon Container */}
                <div className={`${card.color} rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
                  <IconComponent className={`${card.iconColor} w-7 h-7`} />
                </div>

                {/* Card Content */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationCards;
