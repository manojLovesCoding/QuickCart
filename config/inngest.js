
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create Inngest client
export const inngest = new Inngest({
  id: "quickcart2-next",
});

// Sync user creation from Clerk
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await connectDB();

    // Create or update user to avoid duplicate records
    await User.findByIdAndUpdate(
      id,
      userData,
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("User created successfully:", id);
  }
);

// Sync user updation from Clerk
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      email: email_addresses[0].email_address,
      imageUrl: image_url,
    };

    await connectDB();

    await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });

    console.log("User updated successfully:", id);
  }
);

// Sync user deletion from Clerk
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();

    await User.findByIdAndDelete(id);

    console.log("User deleted successfully:", id);
  }
);
