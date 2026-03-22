'use client';

import React, { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { SHOP_ITEMS } from '@/lib/gameData';

type Category = 'food' | 'drink' | 'weapon' | 'clothing' | 'special';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'food', label: 'Essen', icon: '🍔' },
  { id: 'drink', label: 'Trinken', icon: '🍺' },
  { id: 'weapon', label: 'Waffen', icon: '⚔️' },
  { id: 'clothing', label: 'Kleidung', icon: '👕' },
  { id: 'special', label: 'Spezial', icon: '⭐' },
];

export default function ShopTab() {
  const { state, dispatch } = useGame();
  const [category, setCategory] = useState<Category>('food');
  const [buyResult, setBuyResult] = useState<string | null>(null);

  const items = SHOP_ITEMS.filter(i => i.category === category && i.price > 0);

  function handleBuy(itemId: string) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (state.money < item.price) {
      setBuyResult('❌ Nicht genug Geld!');
    } else {
      dispatch({ type: 'BUY_ITEM', itemId });
      setBuyResult(`✅ ${item.name} gekauft!`);
    }
    setTimeout(() => setBuyResult(null), 2000);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 text-center" style={{ background: '#2D2D2D' }}>
        <h2 className="text-lg font-bold">🏪 Späti-Shop</h2>
        <p className="text-sm text-orange-400 font-mono">💰 {state.money.toFixed(2)}€</p>
      </div>

      {/* Categories */}
      <div className="flex border-b border-gray-800">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all
              ${category === cat.id ? 'text-orange-400 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            {cat.icon}
            <br />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Buy Result */}
      {buyResult && (
        <div className="mx-3 mt-2 p-2 rounded-lg text-center text-sm font-medium animate-fadeIn"
          style={{ background: buyResult.startsWith('✅') ? '#44FF4422' : '#FF444422' }}>
          {buyResult}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.map(item => {
          const canAfford = state.money >= item.price;
          const owned = state.inventory.find(i => i.id === item.id);

          return (
            <div key={item.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#2D2D2D' }}>
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">
                  {item.name}
                  {owned && <span className="text-xs text-gray-500 ml-1">(x{owned.quantity})</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
                <div className="flex gap-2 mt-1 text-xs flex-wrap">
                  {Object.entries(item.effects).map(([key, val]) => (
                    <span key={key} className={val! > 0 ? 'text-green-400' : 'text-red-400'}>
                      {key === 'hunger' ? '🍔' : key === 'thirst' ? '💧' : key === 'health' ? '❤️' : key === 'energy' ? '⚡' : '👊'}
                      {val! > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                  {item.attackBonus && <span className="text-red-400">⚔️ +{item.attackBonus}</span>}
                  {item.defenseBonus && <span className="text-blue-400">🛡️ +{item.defenseBonus}</span>}
                </div>
              </div>
              <button
                onClick={() => handleBuy(item.id)}
                disabled={!canAfford}
                className={`px-4 py-2 rounded-lg text-sm font-bold touch-active transition-all
                  ${canAfford ? 'bg-orange-500/30 text-orange-400 active:scale-95' : 'bg-gray-800 text-gray-600'}`}
              >
                {item.price.toFixed(2)}€
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
