'use client';

export function AddressMapPreview({
  latitude,
  longitude,
}: {
  latitude?: number | string;
  longitude?: number | string;
}) {
  if (!latitude || !longitude) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Sem coordenadas para exibir mapa.
      </div>
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <iframe
        title="Mapa do endereço"
        width="100%"
        height="280"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
      />
    </div>
  );
}
