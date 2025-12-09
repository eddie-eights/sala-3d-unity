export default function UnityView() {
    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950">
           {/* Placeholder for iframe / webgl canvas */}
           <div className="text-center opacity-30">
                <p className="text-4xl font-bold">3D SCENE</p>
                <p>Unity WebGL will be mounted here</p>
           </div>
        </div>
    )
}
