import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { defineEventHandler } from "h3";
import {
  upsertHomeworkState,
  addHomework,
  removeHomework,
} from "~~/server/services/database";

const startSessionCheck = (socket: Socket, intervalMs = 60_000) => {
  const interval = setInterval(async () => {
    try {
      const cookie = socket.request.headers.cookie || "";
      const session = await auth.api.getSession({ headers: { cookie } });

      if (!session?.user?.id) {
        clearInterval(interval);
        socket.disconnect(true);
      }
    } catch {
      clearInterval(interval);
      socket.disconnect(true);
    }
  }, intervalMs);

  socket.on("disconnect", () => {
    clearInterval(interval);
  });
};

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server();

  io.bind(engine);

  io.use(async (socket, next) => {
    try {
      const cookie = socket.request.headers.cookie || "";
      const session = await auth.api.getSession({ headers: { cookie } });

      if (!session?.user?.id) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = session.user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;
    socket.join(userId);

    startSessionCheck(socket);

    socket.on("event-updated", async (event) => {
      try {
        if (!userId || !event?.id) return;

        await upsertHomeworkState(event, userId);

        socket.to(userId).emit("event-updated", event);
      } catch (error) {
        console.error("Failed to update homework state:", error);
      }
    });

    socket.on("event-added", async (event) => {
      try {
        if (!userId || !event?.id) return;
        const addedEvent = await addHomework(event, userId);
        socket.emit("event-update-id", {
          tempId: event.id,
          newId: addedEvent.id,
        });
        socket.to(userId).emit("event-added", { ...event, id: addedEvent.id });
      } catch (error) {
        console.error("Failed to add homework event:", error);
      }
    });

    socket.on("event-removed", async (event) => {
      try {
        if (!userId || !event?.id) return;

        await removeHomework(event.id, userId);

        socket.to(userId).emit("event-removed", event);
      } catch (error) {
        console.error("Failed to remove homework event:", error);
      }
    });
  });

  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler(event: any) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        open(peer: any) {
          // @ts-expect-error private method and property
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error private method and property
          engine.onWebSocket(
            peer._internal.nodeReq,
            peer._internal.nodeReq.socket,
            peer.websocket,
          );
        },
      },
    }),
  );
});
