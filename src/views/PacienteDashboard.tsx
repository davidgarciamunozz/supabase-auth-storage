import { useState } from 'react'
import NavLayout from '../layout/NavLayout'
import RequestQuote from '../components/RequestQuote'
import MyQuotes from '../components/MyQuotes'

type Tab = 'request' | 'quotes'

export default function PacienteDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('request')

    return (
        <NavLayout>
            <div className="patient-dashboard">
                <div className="dashboard-container">
                    <div className="dashboard-hero">
                        <h1>Patient Dashboard</h1>
                        <p>Request quotes and manage your consultations</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button
                            className={`tab ${activeTab === 'request' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('request')}
                        >
                            <span className="tab-icon">📝</span>
                            <span>Request Quote</span>
                        </button>
                        <button
                            className={`tab ${activeTab === 'quotes' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('quotes')}
                        >
                            <span className="tab-icon">💼</span>
                            <span>My Quotes</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="tab-content">
                        {activeTab === 'request' && <RequestQuote />}
                        {activeTab === 'quotes' && <MyQuotes />}
                    </div>
                </div>
            </div>
        </NavLayout>
    )
}
