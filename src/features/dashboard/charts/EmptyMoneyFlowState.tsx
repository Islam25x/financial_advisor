export const EmptyMoneyFlowState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-xs z-40 text-center p-6">
        <p className="text-gray-800 font-medium mb-2"> Not enough transaction history</p>
        <p className="text-white text-sm mb-4">Add more transactions to unlock meaningful money flow insights and spending trends.</p>
    </div>
);