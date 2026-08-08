import { apiFetch } from "../lib/api";

export interface Artist {
  id: string;
  name: string;
  photo?: string;
}

export async function getArtists() {
  return apiFetch<Artist[]>("/artists");
}

export async function getArtistById(
  id: string
) {
  return apiFetch<Artist>(
    `/artists/${id}`
  );
}

export async function createArtist(
  data: Partial<Artist>
) {
  return apiFetch<Artist>("/artists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArtist(
  id: string,
  data: Partial<Artist>
) {
  return apiFetch<Artist>(
    `/artists/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteArtist(
  id: string
) {
  return apiFetch(`/artists/${id}`, {
    method: "DELETE",
  });
}

export async function addArtistToEvent(
  eventId: string,
  artistId: string
) {
  return apiFetch("/artists/event", {
    method: "POST",
    body: JSON.stringify({
      eventId,
      artistId,
    }),
  });
}

export async function getEventArtists(
  eventId: string
) {
  return apiFetch<Artist[]>(
    `/artists/event/${eventId}`
  );
}

export async function removeArtistFromEvent(
  id: string
) {
  return apiFetch(`/artists/event/${id}`, {
    method: "DELETE",
  });
}