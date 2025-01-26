import React from 'react';
import { Code, Zap, Server } from 'lucide-react';

export function PromoBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 mb-8 relative z-10">
      <div className="flex items-start gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Need Custom API Development?</h2>
          <p className="text-blue-100 mb-4">
            Transform your medical practice with our custom API solutions and enhanced integrations
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-200 shrink-0" />
              <span className="text-sm">Custom APIs</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-200 shrink-0" />
              <span className="text-sm">Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-200 shrink-0" />
              <span className="text-sm">Fast Setup</span>
            </div>
          </div>

          <button 
            onClick={() => {
              const contactButton = document.querySelector('[title="Contact Us"]') as HTMLButtonElement;
              if (contactButton) {
                contactButton.click();
              }
            }}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Get Started
          </button>
        </div>

        <div className="hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=300&q=80" 
            alt="API Development"
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}