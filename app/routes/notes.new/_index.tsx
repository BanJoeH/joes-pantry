import type { ActionArgs, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json({ errors: { title: "Title is required" } }, { status: 400 });
  }

  if (typeof body !== "string" || body.length === 0) {
    return json({ errors: { body: "Body is required" } }, { status: 400 });
  }

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
};

const isKeyInObject = <T extends string | number>(
  key: T,
  object: { [key: string | number]: unknown } | undefined
): object is { [key in T]: unknown } => {
  return !!object && object[key] !== undefined;
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isKeyInObject("title", actionData?.errors)) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={
              isKeyInObject("title", actionData?.errors) ? true : undefined
            }
            aria-errormessage={
              isKeyInObject("title", actionData?.errors)
                ? "title-error"
                : undefined
            }
          />
        </label>
        {isKeyInObject("title", actionData?.errors) && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData?.errors?.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={
              isKeyInObject("body", actionData?.errors) ? true : undefined
            }
            aria-errormessage={
              isKeyInObject("body", actionData?.errors)
                ? "body-error"
                : undefined
            }
          />
        </label>
        {isKeyInObject("body", actionData?.errors) && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData?.errors.body}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
