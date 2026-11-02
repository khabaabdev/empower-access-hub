import {
  ArrowRight,
  BookmarkSimple,
  CheckCircle,
  Clock,
  MapPin,
  PaperPlaneTilt,
  Trash,
  Users,
} from "@phosphor-icons/react";
import {
  REQUEST_STATUS_META,
  categoryLabel,
  type ConnectionRequest,
  type ResourceListing,
} from "../data/mockData";

interface SavedRequestCenterProps {
  savedListings: ResourceListing[];
  requests: ConnectionRequest[];
  onOpenListing: (listing: ResourceListing) => void;
  onRemoveSaved: (id: string) => void;
  onWithdrawRequest: (id: string) => void;
  onBrowse: () => void;
}

const STATUS_ORDER: ConnectionRequest["status"][] = ["submitted", "reviewing", "connected"];

export default function SavedRequestCenter({
  savedListings,
  requests,
  onOpenListing,
  onRemoveSaved,
  onWithdrawRequest,
  onBrowse,
}: SavedRequestCenterProps) {
  return (
    <section aria-labelledby="saved-heading" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <h2 id="saved-heading" className="text-app text-2xl font-extrabold tracking-tight sm:text-3xl">
        My connections
      </h2>
      <p className="text-muted-app mt-1 max-w-2xl text-sm">
        Everything you saved and every request in motion. Saved items stay on this device so you can come back
        later without an account.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <PaperPlaneTilt size={20} weight="bold" aria-hidden="true" className="text-accent-app" />
            <h3 className="text-app text-lg font-extrabold">Connection requests</h3>
            <span className="surface-muted text-muted-app rounded-full px-2 py-0.5 text-xs font-extrabold">
              {requests.length}
            </span>
          </div>

          {requests.length === 0 ? (
            <EmptyBlock
              title="No requests sent yet"
              body="Open any listing and choose Request an accessible connection. A coordinator answers within two business days."
              actionLabel="Browse the directory"
              onAction={onBrowse}
            />
          ) : (
            <ul className="space-y-3">
              {requests.map((request) => {
                const currentIndex = STATUS_ORDER.indexOf(request.status);
                return (
                  <li key={request.id} className="card-a11y p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-muted-app text-[11px] font-extrabold uppercase tracking-wider">
                          {request.organization}
                        </p>
                        <h4 className="text-app text-sm font-extrabold leading-snug">{request.listingTitle}</h4>
                      </div>
                      <span className="soft-accent shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
                        {REQUEST_STATUS_META[request.status].label}
                      </span>
                    </div>

                    <p className="text-muted-app mt-2 line-clamp-2 text-xs leading-relaxed">{request.message}</p>
                    {request.accommodations ? (
                      <p className="text-muted-app mt-1 line-clamp-2 text-xs leading-relaxed">
                        <span className="text-app font-extrabold">Accommodations: </span>
                        {request.accommodations}
                      </p>
                    ) : null}

                    <ol className="mt-3 flex items-center gap-1" aria-label="Request progress">
                      {STATUS_ORDER.map((status, index) => {
                        const reached = index <= currentIndex;
                        return (
                          <li key={status} className="flex flex-1 items-center gap-1">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                                reached ? "bg-[var(--app-accent)] text-white" : "surface-muted text-[var(--app-muted)]"
                              }`}
                              aria-hidden="true"
                            >
                              {index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-bold leading-tight ${
                                reached ? "text-app" : "text-muted-app"
                              }`}
                            >
                              {REQUEST_STATUS_META[status].label}
                            </span>
                            {index < STATUS_ORDER.length - 1 ? (
                              <span
                                aria-hidden="true"
                                className={`h-0.5 flex-1 rounded ${reached ? "bg-[var(--app-accent)]" : "bg-[var(--app-border)]"}`}
                              />
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-muted-app flex items-center gap-1.5 text-[11px] font-semibold">
                        <Clock size={13} weight="bold" aria-hidden="true" />
                        Sent {request.createdAt}
                      </p>
                      <button
                        type="button"
                        onClick={() => onWithdrawRequest(request.id)}
                        className="text-muted-app flex min-h-9 items-center gap-1 rounded-lg border border-app px-2.5 text-[11px] font-bold"
                      >
                        <Trash size={13} weight="bold" aria-hidden="true" />
                        Withdraw
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookmarkSimple size={20} weight="bold" aria-hidden="true" className="text-accent-app" />
            <h3 className="text-app text-lg font-extrabold">Saved listings</h3>
            <span className="surface-muted text-muted-app rounded-full px-2 py-0.5 text-xs font-extrabold">
              {savedListings.length}
            </span>
          </div>

          {savedListings.length === 0 ? (
            <EmptyBlock
              title="Nothing saved yet"
              body="Tap the bookmark on any card to keep it here. Great for comparing sensory profiles before you go."
              actionLabel="Find resources"
              onAction={onBrowse}
            />
          ) : (
            <ul className="space-y-3">
              {savedListings.map((listing) => (
                <li key={listing.id} className="card-a11y flex items-start gap-3 p-4">
                  <span className="soft-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <CheckCircle size={18} weight="bold" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-app text-[11px] font-extrabold uppercase tracking-wider">
                      {categoryLabel(listing.category)}
                    </p>
                    <h4 className="text-app text-sm font-extrabold leading-snug">{listing.title}</h4>
                    <p className="text-muted-app mt-0.5 flex items-center gap-1 text-xs font-semibold">
                      <MapPin size={12} weight="bold" aria-hidden="true" />
                      {listing.neighborhood} · {listing.distanceMiles === 0 ? "Remote" : `${listing.distanceMiles} mi`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenListing(listing)}
                        className="bg-accent-app flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold"
                      >
                        Open
                        <ArrowRight size={14} weight="bold" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(listing.id)}
                        aria-label={`Remove ${listing.title} from saved`}
                        className="text-muted-app flex h-10 w-10 items-center justify-center rounded-lg border border-app"
                      >
                        <Trash size={15} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyBlock({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="card-a11y p-6 text-center">
      <Users size={30} weight="bold" aria-hidden="true" className="text-accent-app mx-auto" />
      <h4 className="text-app mt-2 text-sm font-extrabold">{title}</h4>
      <p className="text-muted-app mx-auto mt-1 max-w-xs text-xs leading-relaxed">{body}</p>
      <button
        type="button"
        onClick={onAction}
        className="text-app mt-3 min-h-11 rounded-xl border border-app px-4 text-xs font-extrabold"
      >
        {actionLabel}
      </button>
    </div>
  );
}