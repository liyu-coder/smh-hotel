import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, Home as HomeIcon, Bookmark, MessageCircle, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import qrCodeImage from 'figma:asset/9c84c6a31c3b1c1f211aba98f6bb9fbb17b11aa0.png';

export function Packages() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [txid, setTxid] = useState('');
  const [copied, setCopied] = useState(false);
  const walletAddress = '0xd3609c8cd7c709cdac25507f9937559b23bf3e8';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    if (!amount || !txid) {
      alert('Please fill in all fields');
      return;
    }
    alert('Deposit submitted successfully!');
    setAmount('');
    setTxid('');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white border-b border-black/5 px-6 py-4 flex items-center">
        <button
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 hover:bg-[#f8f8f8] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center pr-9" style={{ fontWeight: 600 }}>
          Recharge
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          {/* QR Code */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white border-2 border-black/10 rounded-xl">
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <div className="flex items-center gap-2 p-4 bg-[#f8f8f8] rounded-xl border border-black/5">
              <input
                type="text"
                value={walletAddress}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: copied ? '#4ade80' : '#D4AF37',
                  color: 'white'
                }}
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-4 h-4" />
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block mb-2 text-sm" style={{ color: '#1a1a1a' }}>
              Enter amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-[#f8f8f8] border border-transparent focus:border-[#D4AF37] focus:outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6b6b6b]">
                USDT-BEP20
              </div>
            </div>
            <p className="text-xs text-[#6b6b6b] mt-2">Minimum: 10 USDT</p>
          </div>

          {/* TXID Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: '#1a1a1a' }}>
                Enter TXID
              </label>
              <span className="text-xs text-[#6b6b6b]">Payment proof</span>
            </div>
            <input
              type="text"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="TXID"
              className="w-full px-4 py-3 rounded-xl bg-[#f8f8f8] border border-transparent focus:border-[#D4AF37] focus:outline-none transition-all"
            />
          </div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900">
              After the deposit is completed, please copy the transaction id and enter on the TXID{' '}
              <span className="text-blue-600">input</span>.
            </p>
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/30"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Deposit
          </button>
        </motion.div>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-6 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <Link
            to="/home"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#D4AF37] transition-colors"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/bookings"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#D4AF37] transition-colors"
          >
            <Bookmark className="w-6 h-6" />
            <span className="text-xs">Reserve</span>
          </Link>

          <a
            href="https://t.me/support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#D4AF37] transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Telegram</span>
          </a>

          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 text-[#6b6b6b] hover:text-[#D4AF37] transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">My</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
