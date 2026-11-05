// Platform Performance & Marketing Attribution Intelligence Store
// Calculates ROI metrics, channel conversion rates, lead attribution,
// and strategic advertising recommendations based on real bookings and traffic.

import { bookingStore } from './bookingStore.js';
import { contactStore } from './contactStore.js';

export const CHANNELS_LIST = [
  'Google Search',
  'Website Direct',
  'LinkedIn',
  'Referral / Partner',
  'Client Recommendation',
  'Direct Email / Call'
];

export const CHANNEL_COLORS = {
  'Google Search': '#84cc16',
  'Website Direct': '#1896ea',
  'LinkedIn': '#0077b5',
  'Referral / Partner': '#f59e0b',
  'Client Recommendation': '#ec4899',
  'Direct Email / Call': '#a855f7',
  'Other': '#64748b'
};

class AnalyticsStore {
  /**
   * Filter bookings by time range ('all', '30d', '7d')
   */
  filterByTime(bookings, timeRange) {
    if (timeRange === 'all') return bookings;
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    return bookings.filter(b => {
      if (!b.createdAt) return true;
      const t = new Date(b.createdAt).getTime();
      return t >= cutoff;
    });
  }

  /**
   * Compute comprehensive channel performance metrics
   */
  getChannelPerformance(timeRange = 'all', platform = 'All') {
    const rawBookings = bookingStore.bookings;
    const filteredByTime = this.filterByTime(rawBookings, timeRange);

    const bookings = platform === 'All' 
      ? filteredByTime 
      : filteredByTime.filter(b => (b.channel || 'Website Direct').toLowerCase() === platform.toLowerCase());

    const totalInquiries = bookings.length;
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

    // Breakdown per channel
    const channelMap = {};
    bookings.forEach(b => {
      const ch = b.channel || 'Website Direct';
      if (!channelMap[ch]) {
        channelMap[ch] = {
          channel: ch,
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          conversionRate: 0,
          percentage: 0
        };
      }
      channelMap[ch].total += 1;
      if (b.status === 'Pending') channelMap[ch].pending += 1;
      else if (b.status === 'Confirmed') channelMap[ch].confirmed += 1;
      else if (b.status === 'Completed') channelMap[ch].completed += 1;
      else if (b.status === 'Cancelled') channelMap[ch].cancelled += 1;
    });

    // Compute rates & percentages
    const channelStats = Object.values(channelMap).map(c => {
      const successful = c.confirmed + c.completed;
      c.conversionRate = c.total > 0 ? Math.round((successful / c.total) * 100) : 0;
      c.percentage = totalInquiries > 0 ? Math.round((c.total / totalInquiries) * 100) : 0;
      return c;
    });

    // Sort by total volume descending
    channelStats.sort((a, b) => b.total - a.total);

    // Top Acquisition Channel
    const topChannel = channelStats.length > 0 ? channelStats[0] : { channel: 'Google Search', total: 0, percentage: 0 };

    // Highest Conversion Rate Channel
    const sortedByConversion = [...channelStats].sort((a, b) => b.conversionRate - a.conversionRate);
    const highestConverting = sortedByConversion.length > 0 ? sortedByConversion[0] : { channel: 'Google Search', conversionRate: 0, confirmed: 0 };

    // Digital Channel Attribution (Online vs Direct)
    const digitalChannels = ['Google Search', 'Website Direct', 'LinkedIn'];
    const digitalCount = bookings.filter(b => digitalChannels.includes(b.channel || 'Website Direct')).length;
    const digitalPercentage = totalInquiries > 0 ? Math.round((digitalCount / totalInquiries) * 100) : 100;

    // Strategic Advertising Recommendations based on live channel performance
    const adRecommendations = this.generateAdRecommendations(channelStats, totalInquiries);

    return {
      totalInquiries,
      confirmedCount,
      pendingCount,
      cancelledCount,
      topChannel,
      highestConverting,
      digitalPercentage,
      digitalCount,
      untrackedCount: Math.max(0, totalInquiries - digitalCount),
      channelStats,
      adRecommendations
    };
  }

  /**
   * Generates actionable advertising decisions
   */
  generateAdRecommendations(channelStats, total) {
    const recommendations = [];

    // 1. Google Search Analysis
    const google = channelStats.find(c => c.channel === 'Google Search');
    if (google && google.total > 0) {
      recommendations.push({
        platform: 'Google Search Ads (High Intent)',
        verdict: 'Primary Budget Allocation (Recommended: 50% - 60% of Ad Spend)',
        status: 'Scale Up',
        statusColor: '#84cc16',
        reason: `${google.percentage}% of incoming inquiries originate from Google Search. Clients searching for software publishing, IT consultancy, and system development in Rwanda have immediate project intent.`,
        suggestedActions: [
          'Target local high-intent keywords: "software development company Kigali", "custom enterprise software Rwanda", "cloud data architecture Rwanda".',
          'Deploy Google Search Campaigns with direct click-to-book links leading to the #contact booking form.'
        ]
      });
    } else {
      recommendations.push({
        platform: 'Google Search Ads',
        verdict: 'High Opportunity Channel',
        status: 'Launch Testing',
        statusColor: '#1896ea',
        reason: 'Capture high-intent searches for software and system development across Rwanda and East Africa.',
        suggestedActions: ['Run targeted Search campaigns with local geo-targeting in Kigali.']
      });
    }

    // 2. LinkedIn B2B Corporate Advertising
    const linkedin = channelStats.find(c => c.channel === 'LinkedIn');
    recommendations.push({
      platform: 'LinkedIn Sponsored Content (B2B Enterprise)',
      verdict: 'Secondary Budget Allocation (Recommended: 25% - 35% of Ad Spend)',
      status: linkedin && linkedin.total > 0 ? 'Scale B2B' : 'Recommended Channel',
      statusColor: '#0077b5',
      reason: 'Ideal for reaching CTOs, Managing Directors, and IT Heads at commercial banks, universities, hospitals, and telecom operators across Rwanda.',
      suggestedActions: [
        'Promote case studies and technical articles to job titles: "Chief Technology Officer", "IT Director", "Head of Digital Transformation".',
        'Use Lead Gen Forms pre-filled with company details.'
      ]
    });

    // 3. Organic Website Direct & SEO
    recommendations.push({
      platform: 'Organic Website Direct & SEO',
      verdict: 'Continuous Investment (No Media Spend, Focus on Content)',
      status: 'Ongoing ROI',
      statusColor: '#10b981',
      reason: 'Organic visitors converted from public web publications, portfolio showcases, and technical articles.',
      suggestedActions: [
        'Publish regular software architecture case studies using the Send Email Public Web Publication generator.',
        'Keep RDB compliance and TIN records updated for enterprise trust.'
      ]
    });

    return recommendations;
  }
}

export const analyticsStore = new AnalyticsStore();

