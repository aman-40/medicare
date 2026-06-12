-- Create the audit function
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    record_id TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        record_id := OLD.id;
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        record_id := NEW.id;
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        record_id := NEW.id;
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert into AuditLog table
    INSERT INTO "AuditLog" (
        "id",
        "actionType",
        "tableName",
        "recordId",
        "oldData",
        "newData",
        "timestamp"
    ) VALUES (
        gen_random_uuid()::text,
        TG_OP,
        TG_TABLE_NAME,
        record_id,
        old_data,
        new_data,
        now()
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS audit_medicine_trigger ON "Medicine";
CREATE TRIGGER audit_medicine_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Medicine"
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

DROP TRIGGER IF EXISTS audit_invoice_trigger ON "Invoice";
CREATE TRIGGER audit_invoice_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Invoice"
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

DROP TRIGGER IF EXISTS audit_purchase_trigger ON "Purchase";
CREATE TRIGGER audit_purchase_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Purchase"
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

DROP TRIGGER IF EXISTS audit_stock_adjustment_trigger ON "StockAdjustment";
CREATE TRIGGER audit_stock_adjustment_trigger
AFTER INSERT OR UPDATE OR DELETE ON "StockAdjustment"
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();
